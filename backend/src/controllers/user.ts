import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createUser,
  authenticateUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  findUserById,
} from '../services/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types';
import pool from '../database/connection';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phone
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user',
      } as AuthResponse);
    }

    // Generate token
    const { generateToken } = await import('../services/auth');
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        email_verified: user.email_verified,
        is_admin: user.is_admin,
      },
      message: 'Registration successful',
    } as AuthResponse);
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authenticateUser(
      validatedData.email,
      validatedData.password
    );

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as AuthResponse);
    }

    const { user, token } = result;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        email_verified: user.email_verified,
        is_admin: user.is_admin,
      },
      message: 'Login successful',
    } as AuthResponse);
  } catch (error: any) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    if (error.message === 'Account is inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const profile = await getUserProfile(req.user.userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    await updateUserProfile(req.user.userId, validatedData);

    const updatedProfile = await getUserProfile(req.user.userId);

    res.json({
      success: true,
      user: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Change password
 */
export async function updatePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    const success = await changePassword(
      req.user.userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Get user's order history
 */
export async function getOrderHistory(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.currency,
        o.created_at,
        o.updated_at,
        json_agg(
          json_build_object(
            'id', oi.id,
            'room_id', oi.room_id,
            'room_name', r.name,
            'booking_date', oi.booking_date,
            'start_time', oi.start_time,
            'end_time', oi.end_time,
            'status', oi.status
          ) ORDER BY oi.booking_date, oi.start_time
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN rooms r ON oi.room_id = r.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [req.user.userId]
    );

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Get saved addresses
 */
export async function getSavedAddresses(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      `SELECT id, company, tax_number, address, is_default, created_at
       FROM user_addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      addresses: result.rows,
    });
  } catch (error) {
    console.error('Get saved addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Save new address
 */
export async function saveAddress(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { company, tax_number, address, is_default } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required',
      });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [req.user.userId]
      );
    }

    const result = await pool.query(
      `INSERT INTO user_addresses (user_id, company, tax_number, address, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, company, tax_number, address, is_default || false]
    );

    res.json({
      success: true,
      address: result.rows[0],
      message: 'Address saved successfully',
    });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Delete address
 */
export async function deleteAddress(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

