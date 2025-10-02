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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and log status
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;


