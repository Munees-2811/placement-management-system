import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Placement Management Server running!`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: http://localhost:${PORT}`);
  console.log(`=============================================`);
});

// Connect to Database
connectDB();
