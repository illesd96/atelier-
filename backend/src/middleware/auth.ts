import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../services/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 * If valid token is provided, adds user to request object
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require it
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

