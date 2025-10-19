import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../database/connection';
import { User } from '../types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days
const VERIFICATION_TOKEN_EXPIRES_HOURS = 24; // Verification token valid for 24 hours

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
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new user with email verification
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS);
    
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name, phone, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email.toLowerCase(), passwordHash, name, phone, verificationToken, tokenExpires]
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
    `SELECT id, email, name, phone, email_verified, active, is_admin, created_at, last_login_at
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

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<boolean> {
  try {
    const result = await pool.query<User>(
      `SELECT * FROM users 
       WHERE verification_token = $1 
       AND verification_token_expires > NOW()`,
      [token]
    );

    const user = result.rows[0];
    
    if (!user) {
      return false;
    }

    // Mark email as verified and clear the token
    await pool.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL 
       WHERE id = $1`,
      [user.id]
    );

    return true;
  } catch (error) {
    console.error('Error verifying email:', error);
    return false;
  }
}

/**
 * Resend verification email (generate new token)
 */
export async function resendVerification(email: string): Promise<{ token: string; user: User } | null> {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return null;
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS);

    await pool.query(
      `UPDATE users 
       SET verification_token = $1, verification_token_expires = $2 
       WHERE id = $3`,
      [verificationToken, tokenExpires, user.id]
    );

    return { token: verificationToken, user };
  } catch (error) {
    console.error('Error resending verification:', error);
    throw error;
  }
}

