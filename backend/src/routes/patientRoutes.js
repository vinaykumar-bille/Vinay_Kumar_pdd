import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyAuth);

router.get('/', authorizeRoles('ADMIN', 'RECEPTIONIST'), async (req, res) => {
  try {
    const list = await dbStore.getAllPatients();
    // Return safe data without passwordHash
    const safe = list.map(({ passwordHash, ...rest }) => rest);
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res, next) => req.user.role === 'ADMIN' || req.user.role === 'RECEPTIONIST' || String(req.user.id) === String(req.params.id) ? next() : res.status(403).json({ error: 'Access denied.' }), async (req, res) => {
  try {
    const profile = await dbStore.getPatientProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Patient not found.' });
    const { passwordHash, ...safe } = profile;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res, next) => req.user.role === 'ADMIN' || String(req.user.id) === String(req.params.id) ? next() : res.status(403).json({ error: 'Access denied.' }), async (req, res) => {
  try {
    const updated = await dbStore.updatePatientProfile(req.params.id, req.body);
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
