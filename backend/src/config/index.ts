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
  
  // Szamlazz.hu Invoice System
  szamlazz: {
    agentKey: process.env.SZAMLAZZ_AGENT_KEY || '',
    username: process.env.SZAMLAZZ_USERNAME || '',
    password: process.env.SZAMLAZZ_PASSWORD || '',
    apiUrl: 'https://www.szamlazz.hu/szamla/',
    enabled: process.env.SZAMLAZZ_ENABLED === 'true',
    // Invoice settings
    seller: {
      bank: process.env.SZAMLAZZ_SELLER_BANK || '',
      bankAccountNumber: process.env.SZAMLAZZ_SELLER_BANK_ACCOUNT || '',
      emailReplyTo: process.env.SZAMLAZZ_SELLER_EMAIL_REPLY || process.env.FROM_EMAIL || '',
      emailSubject: process.env.SZAMLAZZ_EMAIL_SUBJECT || 'Számla',
      emailText: process.env.SZAMLAZZ_EMAIL_TEXT || 'Köszönjük a vásárlást!',
    },
    invoice: {
      paymentMethod: 'Barion',
      currency: 'HUF',
      language: 'hu',
      invoicePrefix: process.env.SZAMLAZZ_INVOICE_PREFIX || '', // Empty string = use Szamlazz.hu default
    },
  },
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  webhookSecret: process.env.WEBHOOK_SECRET || 'webhook-secret',
  
  // Frontend & Backend URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  
  // Studios
  studios: JSON.parse(process.env.STUDIOS || '[{"id":"studio-a","name":"Atelier"},{"id":"studio-b","name":"Frigyes"},{"id":"studio-c","name":"Karinthy"}]'),
  
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


