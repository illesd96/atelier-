import { Request, Response } from 'express';
import emailService from '../services/email';

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_SUBJECT_LENGTH = 300;
const MAX_MESSAGE_LENGTH = 10000;

// Simple in-memory rate limit: max submissions per IP per window.
// Good enough for a single-instance deployment; resets on restart.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;
const submissionLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    submissionLog.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  submissionLog.set(ip, timestamps);

  // Prevent unbounded growth from many unique IPs
  if (submissionLog.size > 10000) {
    for (const [key, values] of submissionLog) {
      if (values.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        submissionLog.delete(key);
      }
    }
  }

  return false;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Handle contact form submissions
 * POST /api/contact
 */
export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof subject !== 'string' || !subject.trim() ||
      typeof message !== 'string' || !message.trim()
    ) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      subject.length > MAX_SUBJECT_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return res.status(400).json({ success: false, error: 'Input too long' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    if (isRateLimited(getClientIP(req))) {
      return res.status(429).json({ success: false, error: 'Too many messages, please try again later' });
    }

    await emailService.sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending contact form message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
