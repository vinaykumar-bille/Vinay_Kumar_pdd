import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// List all doctors with filtering and search
router.get('/', async (req, res) => {
  try {
    const { specialization, department, clinicId, consultationMode, search } = req.query;
    const list = await dbStore.getAllDoctors({ specialization, department, clinicId, consultationMode, search });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specializations
router.get('/specializations', async (req, res) => {
  try {
    const list = await dbStore.getAllSpecializations();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/specializations', verifyAuth, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const newSpec = await dbStore.createSpecialization(req.body);
    res.status(201).json(newSpec);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clinics
router.get('/clinics', async (req, res) => {
  try {
    const list = await dbStore.getAllClinics();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single doctor details
router.get('/:id', async (req, res) => {
  try {
    const doctor = await dbStore.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }
    const availability = await dbStore.getDoctorAvailability(doctor.id);
    res.json({ ...doctor, availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic availability slots for date
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      const schedule = await dbStore.getDoctorAvailability(id);
      return res.json(schedule);
    }

    const slotsData = await dbStore.getDoctorSlotsForDate(id, date);
    res.json(slotsData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create doctor (Admin only)
router.post('/', verifyAuth, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const newDoc = await dbStore.createDoctor(req.body);
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update doctor
router.put('/:id', verifyAuth, authorizeRoles('ADMIN', 'DOCTOR'), async (req, res) => {
  try {
    const updated = await dbStore.updateDoctor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Doctor not found.' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete doctor (Admin only)
router.delete('/:id', verifyAuth, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    await dbStore.deleteDoctor(req.params.id);
    res.json({ success: true, message: 'Doctor profile and schedule removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
