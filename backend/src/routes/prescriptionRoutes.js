import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// List prescriptions with role-based isolation
router.get('/', verifyAuth, async (req, res) => {
  try {
    let { patientId, doctorId, appointmentId } = req.query;

    if (req.user.role === 'PATIENT') {
      patientId = req.user.id; // Patients can only retrieve their own prescriptions
    } else if (req.user.role === 'DOCTOR') {
      doctorId = req.user.docId || req.user.id; // Doctors view their own written prescriptions
    }

    const list = await dbStore.getAllPrescriptions({ patientId, doctorId, appointmentId });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single prescription by ID
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const pres = await dbStore.getPrescriptionById(req.params.id);
    if (!pres) return res.status(404).json({ error: 'Prescription not found.' });

    // Authorization check
    if (req.user.role === 'PATIENT' && pres.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only view your own prescriptions.' });
    }
    if (req.user.role === 'DOCTOR' && pres.doctorId !== req.user.docId && pres.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You are not the prescribing physician.' });
    }

    res.json(pres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create prescription (Strictly restricted to licensed doctors and clinical admins)
router.post('/', verifyAuth, authorizeRoles('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, symptoms, medications, advice, followUpDate } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ error: 'patientId and diagnosis are required fields.' });
    }

    const patient = await dbStore.findUserById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Bind doctor identity to authenticated clinical session
    const doctorId = req.user.docId || req.user.id;
    const doctorName = req.user.name;

    const newPres = await dbStore.createPrescription({
      appointmentId,
      patientId,
      patientName: patient.name,
      doctorId,
      doctorName,
      diagnosis,
      symptoms,
      medications: Array.isArray(medications) ? medications : [],
      advice: advice || '',
      followUpDate: followUpDate || ''
    });

    res.status(201).json(newPres);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
