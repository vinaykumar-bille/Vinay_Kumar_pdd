import express from 'express';
import dbStore from '../models/store.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Retrieve medical records by patient ID (Protected by patient ownership & clinical staff role)
router.get('/:patientId', verifyAuth, async (req, res) => {
  try {
    const targetPatientId = req.params.patientId;

    if (req.user.role === 'PATIENT' && targetPatientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You cannot view records of another patient.' });
    }

    const list = await dbStore.getRecordsByPatient(targetPatientId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload a new medical record
router.post('/', verifyAuth, async (req, res) => {
  try {
    let { patientId, fileName, fileSize, recordType, description, fileUrl } = req.body;

    // Enforce patient identity from authenticated session
    if (req.user.role === 'PATIENT') {
      patientId = req.user.id;
    } else if (!patientId) {
      return res.status(400).json({ error: 'patientId is required.' });
    }

    if (!fileName || !fileName.trim()) {
      return res.status(400).json({ error: 'fileName is required.' });
    }

    const patient = await dbStore.findUserById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient account not found.' });
    }

    const newRecord = await dbStore.createRecord({
      patientId,
      patientName: patient.name,
      fileName: fileName.trim(),
      fileSize: fileSize || '1.0 MB',
      recordType: recordType || 'LAB_REPORT',
      description: description || 'Clinical diagnostic document',
      fileUrl: fileUrl || ''
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete medical record (Ownership verification enforced)
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const record = await dbStore.getRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    if (req.user.role === 'PATIENT' && record.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You cannot delete another patient\'s records.' });
    }

    await dbStore.deleteRecord(req.params.id);
    res.json({ success: true, message: 'Medical record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
