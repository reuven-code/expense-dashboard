import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import * as admin from 'firebase-admin';
import { logger } from './utils/logger';
import { messageRouter } from './routes/messages';
import { appointmentRouter } from './routes/appointments';
import { businessRouter } from './routes/businesses';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://admin.barber-agent.co.il', 'https://your-domain.vercel.app']
    : '*',
  credentials: true
}));

// Rate Limiting (10 requests per hour per IP)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'יותר מדי בקשות, נסה בשנית מאוחר יותר',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/messages', limiter);

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============ FIREBASE INIT ============

const serviceAccount = require('../config/firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// ============ ROUTES ============

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WhatsApp Webhook Routes
app.use('/api/messages', messageRouter(db));

// Appointment Routes (Protected)
app.use('/api/appointments', appointmentRouter(db));

// Business Routes (Protected)
app.use('/api/businesses', businessRouter(db));

// Admin Routes (Protected)
app.use('/api/admin', adminRouter(db));

// ============ ERROR HANDLING ============

app.use(errorHandler);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  });
});

// ============ SERVER START ============

app.listen(PORT, () => {
  logger.info(`🚀 Barber Agent Backend started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
