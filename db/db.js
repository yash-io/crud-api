import mongoose from 'mongoose';

let isConnected = false; // track connection across invocations
let lastError = null;
let attempts = 0;
let connectPromise = null;

const connectDB = async () => {
  if (isConnected) return;
  if (connectPromise) return connectPromise; // in-flight
  const uri = process.env.MONGODB_URI ;
  if (!uri) {
    lastError = new Error('Missing MONGODB_URI environment variable');
    throw lastError;
  }
  const redacted = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://****:****@');

  const tryConnect = async () => {
    attempts++;
    console.log(`[mongo] Attempt ${attempts} connecting -> ${redacted}`);
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      isConnected = true;
      lastError = null;
      console.log('[mongo] Connected host:', conn.connection.host, 'db:', conn.connection.name);
      return conn;
    } catch (err) {
      lastError = err;
      console.error('[mongo] Attempt failed:', err.message);
      throw err;
    }
  };

  // simple retry (3 attempts total)
  connectPromise = tryConnect().catch(async err => {
    for (let i = 2; i <= 3 && !isConnected; i++) {
      await new Promise(r => setTimeout(r, 500 * i));
      try { return await tryConnect(); } catch (e) { /* continue */ }
    }
    throw err;
  }).finally(() => { connectPromise = null; });

  return connectPromise;
};

export const connectionInfo = () => ({
  readyState: mongoose.connection.readyState,
  isConnected,
  attempts,
  lastError: lastError ? lastError.message : null
});

export default connectDB;
