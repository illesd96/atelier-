import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import config from './config';
import routes from './routes';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins for Vercel deployments
const allowedOrigins = [
  config.frontendUrl,
  'https://atelier-frontend-mu.vercel.app',
  /https:\/\/atelier-frontend-.*\.vercel\.app$/, // Allow all Vercel preview deployments
];

// Remove trailing slashes from configured origins
const normalizedOrigins = allowedOrigins.map(origin => 
  typeof origin === 'string' ? origin.replace(/\/$/, '') : origin
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Normalize the origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is allowed
    const isAllowed = normalizedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === normalizedOrigin;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(normalizedOrigin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing middleware (before rate limiting for webhooks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Webhook logging middleware
app.use('/api/webhooks/*', (req, res, next) => {
  console.log('🔔 Webhook request:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Rate limiting (excluding webhooks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path.startsWith('/api/webhooks'), // Don't rate limit webhooks
});
app.use('/api/', limiter);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(config.nodeEnv === 'development' && { details: err.message }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  console.log(`💳 Barion environment: ${config.barion.environment}`);
});

export default app;


