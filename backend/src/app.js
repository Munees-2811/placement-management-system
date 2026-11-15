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
  'https://placementmanagementportal.netlify.app',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
    : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

// Enable Cross-Origin Resource Sharing with strict domain validation
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, Render health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow Netlify branch/preview deploys (e.g. https://deploy-preview-12--placementmanagementportal.netlify.app)
      if (/^https:\/\/[a-z0-9-]+--placementmanagementportal\.netlify\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Access denied for origin: ${origin}`);
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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
