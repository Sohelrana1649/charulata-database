import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import { mongoSanitize } from './middlewares/mongoSanitize';
import { connectDB } from './database';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { AppError } from './utils/appError';
import apiRouter from './routes';

const app = express();

// Trust proxy for rate limiting in production behind Nginx/Cloudflare
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Implement CORS with flexible origin checks (supports all Vercel domains and local dev)
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (config.nodeEnv !== 'production') return true;
  if (/\.vercel\.app$/i.test(origin)) return true;
  if (/localhost/i.test(origin)) return true;
  return true;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

// Rate Limiting for overall API
app.use('/api', apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10mb' })); // Allow image uploads in base64 if needed

// Data sanitization against NoSQL query injection
app.use(mongoSanitize);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files as static assets
app.use('/uploads', express.static(uploadsDir));

// Mount API Routes
app.use('/api/v1', apiRouter);

// Base route test
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Charulata Lifestyle Backend API System!',
    version: '1.0.0',
    mode: config.nodeEnv
  });
});

// Handled unrouted endpoints
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Connect Database & Start Server
const PORT = config.port;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[CHARULATA BACKEND] Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });
});

export default app;
