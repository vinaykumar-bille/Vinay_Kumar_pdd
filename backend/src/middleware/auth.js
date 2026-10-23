import jwt from 'jsonwebtoken';
import dbStore from '../models/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medibook-ai-super-secure-production-jwt-token-key-2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      docId: user.docId || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dbStore.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User associated with this token no longer exists.' });
      }
      if (user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ error: 'Account has been deactivated. Please contact administrator.' });
      }

      req.user = user;
      next();
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Session has expired or token is invalid. Please log in again.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication processing failed.' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: `Access Denied: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is "${userRole}".`
      });
    }

    next();
  };
};
