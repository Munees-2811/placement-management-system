import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server only after database connection is verified
const startServer = async () => {
  try {
    // 1. Ensure database connection is established before accepting API requests
    await connectDB();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 Placement Management Server running!`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`=============================================`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        try {
          if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close(false);
            console.log('✅ MongoDB connection closed.');
          }
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error(`❌ Fatal server startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();

