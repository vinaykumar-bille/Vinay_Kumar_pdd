import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnectedToMongo = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('🔄 Connecting to MongoDB cluster...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      isConnectedToMongo = true;
      console.log('✅ MongoDB connected successfully to database cluster.');
      return true;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection error: ${err.message}. Operating in High-Fidelity Active Local Store mode.`);
      isConnectedToMongo = false;
      return false;
    }
  } else {
    console.log('ℹ️ MONGODB_URI not specified. Operating in High-Fidelity In-Memory Store mode with sample healthcare dataset.');
    isConnectedToMongo = false;
    return false;
  }
};

export const getDbStatus = () => ({
  mode: isConnectedToMongo ? 'MONGODB_ATLAS' : 'IN_MEMORY_PERSISTED',
  connected: true,
  timestamp: new Date().toISOString()
});
