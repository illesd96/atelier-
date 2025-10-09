import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/connection';
import { User } from '../types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email.toLowerCase(), passwordHash, name, phone]
    );

    return result.rows[0];
  } catch (error: any) {
    // Check for unique constraint violation (duplicate email)
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await pool.query(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

/**
 * Authenticate user and return token
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  if (!user.active) {
    throw new Error('Account is inactive');
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await updateLastLogin(user.id);

  // Generate token
  const token = generateToken(user.id, user.email);

  return { user, token };
}

/**
 * Get user profile (without password hash)
 */
export async function getUserProfile(userId: string) {
  const result = await pool.query(
    `SELECT id, email, name, phone, email_verified, active, created_at, last_login_at
     FROM users 
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; phone?: string }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }

  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(updates.phone);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(userId);

  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`,
    values
  );
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await findUserById(userId);
  
  if (!user) {
    return false;
  }

  const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
  
  if (!isValidPassword) {
    return false;
  }

  const newPasswordHash = await hashPassword(newPassword);
  
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [newPasswordHash, userId]
  );

  return true;
}

