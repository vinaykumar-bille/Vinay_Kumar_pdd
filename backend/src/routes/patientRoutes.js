import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// List patients - only clinical and administrative staff
router.get('/', verifyAuth, authorizeRoles('DOCTOR', 'RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const list = await dbStore.getAllPatients();
    // Return safe data without passwordHash
    const safe = list.map(({ passwordHash, ...rest }) => rest);
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient profile - ownership check for patients, allowed for staff
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    if (req.user.role === 'PATIENT' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied: You can only view your own patient profile.' });
    }

    const profile = await dbStore.getPatientProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Patient not found.' });
    const { passwordHash, ...safe } = profile;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient profile - ownership check for patients, allowed for staff
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    if (req.user.role === 'PATIENT' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied: You can only update your own patient profile.' });
    }

    const updated = await dbStore.updatePatientProfile(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Patient not found.' });
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
