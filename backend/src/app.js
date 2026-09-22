import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

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

// API Routes
app.use('/api/auth', authRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
