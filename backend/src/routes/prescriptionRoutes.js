import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyAuth);

router.get('/', authorizeRoles('ADMIN', 'DOCTOR'), async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.query;
    const list = await dbStore.getAllPrescriptions({ patientId, doctorId, appointmentId });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authorizeRoles('DOCTOR'), async (req, res) => {
  try {
    const { appointmentId, patientId, patientName, doctorId, doctorName, diagnosis, symptoms, medications, advice, followUpDate } = req.body;

    if (!patientId || !doctorId || !diagnosis) {
      return res.status(400).json({ error: 'patientId, doctorId, and diagnosis are required.' });
    }

    const newPres = await dbStore.createPrescription({
      appointmentId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      diagnosis,
      symptoms,
      medications,
      advice,
      followUpDate
    });

    res.status(201).json(newPres);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
