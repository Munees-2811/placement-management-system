import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Ensures connection is established before server starts accepting requests.
 * Exits process with a clear error message if database connection fails.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_management_db';

  if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
    console.error('❌ [MongoDB Error] MONGO_URI environment variable is required in production!');
    console.error('👉 Please set MONGO_URI in your Render service environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Error] Database connection failed: ${error.message}`);
    console.error(`👉 Details: Ensure your MongoDB cluster is accessible, credentials are valid, and IP access (0.0.0.0/0) is configured in MongoDB Atlas.`);
    console.error(`🛑 Process terminating: Server will not start without a valid database connection.`);
    process.exit(1);
  }
};

export default connectDB;

