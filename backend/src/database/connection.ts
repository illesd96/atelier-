import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env file in development (won't exist on Vercel)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Log database URL for debugging (masked)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
} else {
  // Log masked version for security
  const masked = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log('🔗 Attempting to connect to database:', masked);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,  // Reduced for Neon free tier (max 10 connections)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,  // Increased timeout for database wake-up
});

// Test connection and log status
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;


