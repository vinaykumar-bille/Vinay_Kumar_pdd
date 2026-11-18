import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyAuth);

router.get('/:patientId', (req, res, next) => req.user.role === 'ADMIN' || String(req.user.id) === String(req.params.patientId) ? next() : res.status(403).json({ error: 'Access denied.' }), async (req, res) => {
  try {
    const list = await dbStore.getRecordsByPatient(req.params.patientId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authorizeRoles('ADMIN', 'DOCTOR'), async (req, res) => {
  try {
    const { patientId, patientName, fileName, fileSize, recordType, description, fileUrl } = req.body;
    if (!patientId || !fileName) {
      return res.status(400).json({ error: 'patientId and fileName are required.' });
    }
    const newRecord = await dbStore.createRecord({
      patientId,
      patientName,
      fileName,
      fileSize,
      recordType,
      description,
      fileUrl
    });
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    await dbStore.deleteRecord(req.params.id);
    res.json({ success: true, message: 'Record removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
