import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { connectDB, getDbStatus } from './src/config/db.js';
import dbStore from './src/models/store.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import prescriptionRoutes from './src/routes/prescriptionRoutes.js';
import recordRoutes from './src/routes/recordRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import receptionistRoutes from './src/routes/receptionistRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO for real-time web & mobile synchronization
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  // User room subscription for real-time notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    // Clean up
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    product: 'MediBook AI Healthcare Platform',
    version: '1.0.0',
    database: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Seed data reset endpoint for demonstration testing
app.post('/api/seed/reset', (req, res) => {
  dbStore.reset();
  res.json({ success: true, message: 'MediBook AI demonstration database reset to pristine baseline state.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/specializations', (req, res, next) => {
  // Alias to doctorRoutes handler
  req.url = '/specializations' + req.url;
  doctorRoutes(req, res, next);
});
app.use('/api/clinics', (req, res, next) => {
  req.url = '/clinics' + req.url;
  doctorRoutes(req, res, next);
});
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Fallback for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  res.status(status).json({ error: message });
});

// Server Startup
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 MediBook AI Backend API Server Listening on Port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Role Support: PATIENT | DOCTOR | RECEPTIONIST | ADMIN`);
    console.log(`🤖 AI Engine: Active with Explainable Clinical Fallback`);
    console.log(`======================================================\n`);
  });
};

startServer();

export { app, server, io };
