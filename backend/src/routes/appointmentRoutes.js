import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// List appointments with role-based isolation (Patients only see their own, Doctors see their roster)
router.get('/', verifyAuth, async (req, res) => {
  try {
    let { patientId, doctorId, clinicId, status, date, search } = req.query;

    if (req.user.role === 'PATIENT') {
      patientId = req.user.id; // Strictly enforce patient ownership
    } else if (req.user.role === 'DOCTOR') {
      doctorId = req.user.docId || req.user.id; // Strictly enforce doctor roster
    }

    const list = await dbStore.getAllAppointments({ patientId, doctorId, clinicId, status, date, search });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single appointment with ownership validation
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    // Enforce data access authorization
    if (req.user.role === 'PATIENT' && appt.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only view your own appointments.' });
    }
    if (req.user.role === 'DOCTOR' && appt.doctorId !== req.user.docId && appt.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You are not assigned to this appointment.' });
    }

    res.json(appt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new appointment (Strict server-side validation & patient session binding)
router.post('/', verifyAuth, async (req, res) => {
  try {
    let { doctorId, appointmentDate, date, startTime, timeSlot, consultationType, reasonForVisit, symptoms, patientId, patientName } = req.body;
    appointmentDate = appointmentDate || date;
    startTime = startTime || timeSlot;
    reasonForVisit = reasonForVisit || symptoms;

    // Server-side identity enforcement: Bind to authenticated session for patients
    if (req.user.role === 'PATIENT') {
      patientId = req.user.id;
      patientName = req.user.name;
    } else if (!patientId) {
      return res.status(400).json({ error: 'patientId is required when booking as staff.' });
    }

    if (!doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'doctorId, appointmentDate, and startTime are required fields.' });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return res.status(400).json({ error: 'Invalid appointment date format. Use YYYY-MM-DD.' });
    }

    // Prevent past appointments
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      return res.status(400).json({ error: `Cannot schedule appointment for a past date (${appointmentDate}). Please select today or a future date.` });
    }

    // Verify doctor availability for the requested day
    const doctor = await dbStore.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Selected doctor not found.' });
    }

    const dateObj = new Date(appointmentDate + 'T00:00:00');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[dateObj.getDay()];
    const avail = await dbStore.getDoctorAvailability(doctorId);

    if (avail && avail.workingDays && avail.workingDays.length > 0 && !avail.workingDays.includes(dayName)) {
      return res.status(400).json({
        error: `${doctor.name} does not consult on ${dayName}s. Available days: ${avail.workingDays.join(', ')}.`
      });
    }

    if (avail && avail.leaveDates && avail.leaveDates.includes(appointmentDate)) {
      return res.status(400).json({
        error: `${doctor.name} is on leave on ${appointmentDate}. Please choose another date.`
      });
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
    if (error.message.includes('already') || error.message.includes('not available')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// Reschedule appointment with ownership check
router.patch('/:id/reschedule', verifyAuth, async (req, res) => {
  try {
    let { newDate, date, newStartTime, timeSlot, reason } = req.body;
    newDate = newDate || date;
    newStartTime = newStartTime || timeSlot;

    if (!newDate || !newStartTime) {
      return res.status(400).json({ error: 'newDate and newStartTime are required for rescheduling.' });
    }

    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    // Authorization check
    if (req.user.role === 'PATIENT' && appt.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only reschedule your own appointments.' });
    }

    // Prevent past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (newDate < todayStr) {
      return res.status(400).json({ error: `Cannot reschedule to a past date (${newDate}).` });
    }

    const updated = await dbStore.rescheduleAppointment(req.params.id, {
      newDate,
      newStartTime,
      reason: reason || 'Patient requested reschedule',
      updatedBy: req.user.role
    });

    res.json(updated);
  } catch (error) {
    if (error.message.includes('already booked')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// Cancel appointment with ownership check
router.patch('/:id/cancel', verifyAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    // Authorization check
    if (req.user.role === 'PATIENT' && appt.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only cancel your own appointments.' });
    }

    const updated = await dbStore.cancelAppointment(req.params.id, {
      reason: reason || 'Cancelled by user',
      cancelledBy: req.user.role
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update appointment status (Restricted to clinical staff)
router.patch('/:id/status', verifyAuth, authorizeRoles('DOCTOR', 'RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { status, doctorNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = await dbStore.updateAppointmentStatus(req.params.id, {
      status,
      doctorNotes,
      updatedBy: req.user.role
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Appointment history & reschedule audit (Protected)
router.get('/:id/history', verifyAuth, async (req, res) => {
  try {
    const appt = await dbStore.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    if (req.user.role === 'PATIENT' && appt.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only view audit history of your own appointments.' });
    }

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
