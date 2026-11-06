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
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resume files statically
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    message: 'Placement Management System API is healthy and operational',
    database: isDbConnected ? 'MongoDB (Connected)' : 'Local File Persistence (Active)',
    timestamp: new Date().toISOString(),
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

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
