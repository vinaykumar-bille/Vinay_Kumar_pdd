import express from 'express';
import dbStore from '../models/store.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const list = await dbStore.getNotifications(req.params.userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await dbStore.markNotificationRead(req.params.id);
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/read-all/:userId', async (req, res) => {
  try {
    const result = await dbStore.markAllNotificationsRead(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
