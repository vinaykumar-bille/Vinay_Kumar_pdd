import express from 'express';
import dbStore from '../models/store.js';

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const stats = await dbStore.getAnalyticsOverview();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export data generator
router.get('/export/appointments', async (req, res) => {
  try {
    const list = await dbStore.getAllAppointments();
    const rows = [
      ['AppointmentNumber', 'PatientName', 'DoctorName', 'Department', 'Date', 'Time', 'Type', 'Status', 'Reason'],
      ...list.map(a => [
        a.appointmentNumber,
        `"${a.patientName}"`,
        `"${a.doctorName}"`,
        `"${a.department}"`,
        a.appointmentDate,
        a.startTime,
        a.consultationType,
        a.status,
        `"${(a.reasonForVisit || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="medibook_appointments_export.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await dbStore.getAuditLogs(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
