import express from 'express';
import rateLimit from 'express-rate-limit';
import aiService from '../services/aiService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Dedicated rate limiter for AI Healthcare Assistant endpoints
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many healthcare assistant requests. Please slow down.' }
});

/**
 * POST /api/ai/recommend-doctors
 * Multi-attribute doctor recommendation engine with clinical explanation.
 */
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

/**
 * POST /api/ai/specialty-guidance
 * Clinical NLP symptom-to-specialty triage.
 */
router.post('/specialty-guidance', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ error: 'Symptoms description is required and cannot be empty.' });
    }
    const guidance = await aiService.getSpecialtyGuidance({ symptoms: symptoms.trim() });
    res.json(guidance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/triage (alias to specialty-guidance for mobile client compatibility)
 */
router.post('/triage', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ error: 'Symptoms description is required and cannot be empty.' });
    }
    const guidance = await aiService.getSpecialtyGuidance({ symptoms: symptoms.trim() });
    res.json(guidance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/appointment-forecast
 * 7-day operational appointment demand and clinical capacity projection.
 */
router.get('/appointment-forecast', async (req, res) => {
  try {
    const forecast = await aiService.getAppointmentForecast();
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * Protected healthcare conversation assistant powered by Ollama local LLM with clinical red-flag guardrails.
 */
router.post('/chat', aiChatLimiter, verifyAuth, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate payload
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message query is required and cannot be empty.' });
    }

    const trimmed = message.trim();
    if (trimmed.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum allowable length of 2000 characters.' });
    }

    const validHistory = Array.isArray(history) ? history.slice(-15) : [];

    const reply = await aiService.chatAssistant({
      message: trimmed,
      history: validHistory,
      user: req.user
    });

    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while processing the healthcare query.' });
  }
});

/**
 * GET /api/ai/ollama/status
 * Queries Ollama connection status, configured model availability, and response latency.
 */
router.get('/ollama/status', async (req, res) => {
  try {
    const status = await aiService.getOllamaStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MediBook AI Healthcare Assistant Engine',
    timestamp: new Date().toISOString()
    });
});

export default router;
