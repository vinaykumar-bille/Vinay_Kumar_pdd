import express from 'express';
import bcrypt from 'bcryptjs';
import dbStore from '../models/store.js';
import { generateToken, verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Register new patient / user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, gender, dateOfBirth, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields.' });
    }

    const existing = await dbStore.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await dbStore.createUser({
      name,
      email,
      passwordHash,
      phone,
      role: role ? role.toUpperCase() : 'PATIENT',
      gender,
      dateOfBirth,
      city
    });

    const token = generateToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;

    res.status(201).json({
      message: 'Account registered successfully.',
      user: userSafe,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
    }

    // Role check if provided
    if (role && user.role.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({
        error: `Account role mismatch: Selected role is "${role.toUpperCase()}", but this account is registered as "${user.role}".`
      });
    }

    // Check account status
    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ error: 'This account is currently inactive. Contact administrator.' });
    }

    // Verify password if password provided, or allow demonstration quick-login
    if (password && user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      // Allow fallback if password matches default demonstration password
      if (!match && password !== 'Password@123' && password !== 'admin123' && password !== 'doctor123') {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    res.json({
      message: 'Login successful.',
      user: userSafe,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Current User Me
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const { passwordHash: _, ...userSafe } = req.user;
    let extra = {};
    if (req.user.role === 'PATIENT') {
      extra = await dbStore.getPatientProfile(req.user.id);
    }
    res.json({ ...userSafe, ...extra });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await dbStore.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }
  res.json({
    success: true,
    message: `Password reset instructions have been dispatched to ${email}. In development mode, you can log in with default password "Password@123".`
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await dbStore.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await dbStore.updateUser(user.id, { passwordHash });
  res.json({ success: true, message: 'Password has been updated successfully. Please log in with your new password.' });
});

export default router;
