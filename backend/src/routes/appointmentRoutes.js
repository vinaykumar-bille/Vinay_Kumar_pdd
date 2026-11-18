import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyAuth);

const canReadAppointment = (user, appt) =>
  user.role === 'ADMIN' ||
  (user.role === 'PATIENT' && String(user.id) === String(appt.patientId)) ||
  (user.role === 'DOCTOR' && String(user.docId || user.id) === String(appt.doctorId));

const appointmentAccess = async (req, res, next) => {
  try {
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
    if (!canReadAppointment(req.user, appt)) return res.status(403).json({ error: 'Access denied.' });
    req.appointment = appt;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Unable to verify appointment access.' });
  }
};

// List appointments with filtering
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, clinicId, status, date, search } = req.query;
    const scoped = req.user.role === 'PATIENT'
      ? { patientId: req.user.id, status, date, search }
      : req.user.role === 'DOCTOR'
        ? { doctorId: req.user.docId || req.user.id, status, date, search }
        : req.user.role === 'ADMIN' || req.user.role === 'RECEPTIONIST'
          ? { patientId, doctorId, clinicId, status, date, search }
          : null;
    if (!scoped) return res.status(403).json({ error: 'Access denied.' });
    const list = await dbStore.getAllAppointments(scoped);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single appointment
router.get('/:id', appointmentAccess, async (req, res) => {
  try {
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
    res.json(appt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new appointment (Atomic slot reservation & duplicate prevention)
router.post('/', authorizeRoles('PATIENT', 'ADMIN', 'RECEPTIONIST'), async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, startTime, consultationType, reasonForVisit, patientName } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'patientId, doctorId, appointmentDate, and startTime are required.' });
    }

    if (req.user.role === 'PATIENT' && String(patientId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Cannot book for another patient.' });
    }
    const appt = await dbStore.createAppointment({
      patientId,
      patientName,
      doctorId,
      appointmentDate,
      startTime,
      consultationType,
      reasonForVisit
    });

    res.status(201).json(appt);
  } catch (error) {
    // Return 409 Conflict if slot is already reserved
    if (error.message.includes('already') || error.message.includes('not available')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', appointmentAccess, async (req, res) => {
  try {
    const { newDate, newStartTime, reason, updatedBy } = req.body;

    if (!newDate || !newStartTime) {
      return res.status(400).json({ error: 'newDate and newStartTime are required for rescheduling.' });
    }

    const updated = await dbStore.rescheduleAppointment(req.params.id, {
      newDate,
      newStartTime,
      reason: reason || 'Patient requested reschedule',
      updatedBy: updatedBy || 'PATIENT'
    });

    res.json(updated);
  } catch (error) {
    if (error.message.includes('already booked')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// Cancel appointment
router.patch('/:id/cancel', appointmentAccess, async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const updated = await dbStore.cancelAppointment(req.params.id, {
      reason: reason || 'Cancelled by user',
      cancelledBy: cancelledBy || 'PATIENT'
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update appointment status (CHECKED_IN, IN_CONSULTATION, COMPLETED, NO_SHOW, etc.)
router.patch('/:id/status', authorizeRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), appointmentAccess, async (req, res) => {
  try {
    const { status, doctorNotes, updatedBy } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = await dbStore.updateAppointmentStatus(req.params.id, {
      status,
      doctorNotes,
      updatedBy
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Appointment history & reschedule audit
router.get('/:id/history', appointmentAccess, async (req, res) => {
  try {
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({
      appointmentNumber: appt.appointmentNumber,
      status: appt.status,
      createdAt: appt.createdAt,
      rescheduleHistory: appt.rescheduleHistory || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
