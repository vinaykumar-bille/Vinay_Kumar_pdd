import express from 'express';
import bcrypt from 'bcryptjs';
import dbStore from '../models/store.js';

const router = express.Router();

// Receptionist Clinic Queue
router.get('/queue', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { date = todayStr, clinicId = 'clinic_1' } = req.query;

    const allToday = await dbStore.getAllAppointments({ clinicId });
    
    const checkedIn = allToday.filter(a => a.status === 'CHECKED_IN');
    const inConsultation = allToday.filter(a => a.status === 'IN_CONSULTATION');
    const upcoming = allToday.filter(a => ['CONFIRMED', 'PENDING', 'RESCHEDULED'].includes(a.status));
    const completed = allToday.filter(a => a.status === 'COMPLETED');

    res.json({
      date,
      clinicId,
      summary: {
        waitingCount: checkedIn.length,
        inConsultationCount: inConsultation.length,
        upcomingCount: upcoming.length,
        completedCount: completed.length,
        totalQueue: allToday.length
      },
      checkedIn,
      inConsultation,
      upcoming,
      completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Front desk check-in
router.post('/check-in/:id', async (req, res) => {
  try {
    const updated = await dbStore.updateAppointmentStatus(req.params.id, {
      status: 'CHECKED_IN',
      updatedBy: 'RECEPTIONIST'
    });
    res.json({ success: true, message: 'Patient marked as Checked In and added to Doctor Waiting Queue.', appointment: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Front desk move to In-Consultation
router.post('/call-in/:id', async (req, res) => {
  try {
    const updated = await dbStore.updateAppointmentStatus(req.params.id, {
      status: 'IN_CONSULTATION',
      updatedBy: 'RECEPTIONIST'
    });
    res.json({ success: true, message: 'Patient called into doctor consultation cabin.', appointment: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Walk-in booking on behalf of patient
router.post('/book', async (req, res) => {
  try {
    const { name, email, phone, gender, dateOfBirth, doctorId, appointmentDate, startTime, consultationType, reasonForVisit } = req.body;

    if (!name || !doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'Patient name, doctor, date, and time slot are required.' });
    }

    // Find or create patient
    let patient = null;
    const cleanEmail = email ? email.toLowerCase() : `walkin_${Date.now()}@medibook.ai`;
    patient = await dbStore.findUserByEmail(cleanEmail);

    if (!patient) {
      const passwordHash = await bcrypt.hash('Password@123', 10);
      patient = await dbStore.createUser({
        name,
        email: cleanEmail,
        phone: phone || '+91 99999 00000',
        passwordHash,
        role: 'PATIENT',
        gender: gender || 'Not Specified',
        dateOfBirth: dateOfBirth || '1995-01-01'
      });
    }

    const appt = await dbStore.createAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId,
      appointmentDate,
      startTime,
      consultationType: consultationType || 'IN_PERSON',
      reasonForVisit: reasonForVisit || 'Walk-in Clinic Consultation'
    });

    res.status(201).json({
      message: 'Walk-in appointment booked successfully by Receptionist.',
      appointment: appt
    });
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

export default router;
