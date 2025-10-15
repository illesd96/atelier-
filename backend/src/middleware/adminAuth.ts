import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './auth';
import pool from '../database/connection';

/**
 * Middleware to check if user is an admin
 * Must be used after authenticateToken middleware
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Check if user is admin
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1 AND active = true',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    if (!result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Combined middleware: authenticate token and require admin
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, (err?: any) => {
    if (err) return next(err);
    requireAdmin(req, res, next);
  });
}

