import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/photo_studio',
  
  // Removed Cal.com integration - using internal booking system
  
  // Barion
  barion: {
    environment: process.env.BARION_ENVIRONMENT || 'test',
    posKey: process.env.BARION_POS_KEY || '',
    pixelId: process.env.BARION_PIXEL_ID || '',
    payeeEmail: process.env.BARION_PAYEE_EMAIL || '',
    baseUrl: process.env.BARION_ENVIRONMENT === 'prod' 
      ? 'https://api.barion.com' 
      : 'https://api.test.barion.com',
  },
  
  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'noreply@yourstudio.com',
    fromName: process.env.FROM_NAME || 'Photo Studio',
  },
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  webhookSecret: process.env.WEBHOOK_SECRET || 'webhook-secret',
  
  // Frontend & Backend URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  
  // Studios
  studios: JSON.parse(process.env.STUDIOS || '[{"id":"studio-a","name":"Studio A"},{"id":"studio-b","name":"Studio B"},{"id":"studio-c","name":"Studio C"},{"id":"makeup","name":"Makeup Studio"}]'),
  
  // Business settings
  business: {
    hourlyRate: 15000, // HUF per hour
    currency: 'HUF',
    timezone: 'Europe/Budapest',
    openingHours: {
      start: 8, // 8:00
      end: 20,  // 20:00
    },
    cancellationWindow: 24, // hours
  },
};

export default config;


