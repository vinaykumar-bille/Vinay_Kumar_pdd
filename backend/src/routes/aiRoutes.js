import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

router.post('/recommend-doctors', async (req, res) => {
  try {
    const { specialization, symptoms, budget, language, consultationType, preferredDate } = req.body;
    const recommendations = await aiService.recommendDoctors({
      specialization,
      symptoms,
      budget,
      language,
      consultationType,
      preferredDate
    });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/specialty-guidance', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms description is required.' });
    }
    const guidance = await aiService.getSpecialtyGuidance({ symptoms });
    res.json(guidance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/appointment-forecast', async (req, res) => {
  try {
    const forecast = await aiService.getAppointmentForecast();
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query is required.' });
    }
    const reply = await aiService.chatAssistant({ message, history });
    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MediBook AI Healthcare Assistant Engine',
    timestamp: new Date().toISOString()
  });
});

export default router;
