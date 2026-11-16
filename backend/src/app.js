import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import studentProfileRoutes from './routes/studentProfileRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import placementDriveRoutes from './routes/placementDriveRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (Render, AWS, Nginx) so req.protocol and client IP resolve accurately
app.set('trust proxy', 1);

// Allowed origins for CORS (Netlify production, custom CLIENT_URL, local development)
const allowedOrigins = [
  'https://placementmanagementsystem1.netlify.app',
  'https://placementmanagementportal.netlify.app',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
    : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

// Helper: check if a given origin is permitted
export const isAllowedOrigin = (origin) => {
  if (!origin) return true; // curl / Postman / server-to-server / health checks
  const normalized = origin.trim().replace(/\/+$/, '');
  if (allowedOrigins.includes(normalized)) return true;
  // Allow all Netlify deployments (production sites, branch deploys, preview builds)
  if (/^https:\/\/([a-z0-9-]+--)?([a-z0-9-]+)\.netlify\.app$/i.test(normalized)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  optionsSuccessStatus: 200, // IE11 & legacy Safari cannot handle 204
};

// ── CORS ────────────────────────────────────────────────────────────────────
// 1. Handle OPTIONS preflight FIRST on every route — must be before any other middleware
app.options('*', cors(corsOptions));
// 2. Apply CORS headers to all subsequent requests
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resume files statically from backend/uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoint reporting actual MongoDB connection status
app.get('/api/health', (req, res) => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  const isConnected = stateCode === 1;
  const stateLabel = readyStates[stateCode] || 'unknown';

  const healthPayload = {
    status: isConnected ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: isConnected,
      status: stateLabel,
      readyState: stateCode,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  };

  if (!isConnected) {
    return res.status(503).json({
      ...healthPayload,
      message: 'Service Unavailable: MongoDB connection is not established.',
    });
  }

  return res.status(200).json({
    ...healthPayload,
    message: 'Placement Management System API is healthy and database is connected.',
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Student Placement Management System API is running successfully.');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student/profile', studentProfileRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', placementDriveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
