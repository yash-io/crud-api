import mongoose from 'mongoose';

let isConnected = false; // track connection across invocations

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI environment variable');
  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export default connectDB;
