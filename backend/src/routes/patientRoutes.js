import express from 'express';
import dbStore from '../models/store.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await dbStore.getAllPatients();
    // Return safe data without passwordHash
    const safe = list.map(({ passwordHash, ...rest }) => rest);
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await dbStore.getPatientProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Patient not found.' });
    const { passwordHash, ...safe } = profile;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await dbStore.updatePatientProfile(req.params.id, req.body);
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
