import express from "express";
import dotenv from "dotenv";
import connectDB, { connectionInfo } from "./db/db.js";
import mongoose from "mongoose";
import personRouter from "./router/crud.routes.js";

dotenv.config();

// Kick off an initial (non-blocking) connection attempt
connectDB().then(()=>{
  console.log("Initial Mongo connection ok");
}).catch(err => {
  console.error("Initial DB connection attempt failed (will retry on demand)", err.message);
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to ensure DB connected before hitting /person routes
const ensureDb = async (_req, _res, next) => {
  try {
    await connectDB();
    return next();
  } catch (e) {
    return next(e);
  }
};

app.use("/person", ensureDb, personRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", endpoints: ["GET /person", "POST /person", "GET /person/:id", "PUT /person/:id", "DELETE /person/:id"], env: process.env.NODE_ENV || 'development' });
});

app.get('/health', (_req, res) => {
  const mongoState = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  res.json({ status: 'ok', mongoState, isConnected: mongoState === 1, ...connectionInfo() });
});

app.get('/diag', ensureDb, async (_req, res, next) => {
  try {
  const mongoState = mongoose.connection.readyState;
  const dbName = mongoose.connection.name;
    let count = null;
    try {
      // Lazy import to avoid circular issues
      const { default: Person } = await import('./models/Person.js');
      count = await Person.estimatedDocumentCount();
    } catch (e) {
      // ignore model errors
    }
  res.json({ ok: true, mongoState, dbName, personCount: count, info: connectionInfo() });
  } catch (e) { next(e); }
});

// Quick environment variable presence check (sanitized)
app.get('/env-check', (_req, res) => {
  const mongo = process.env.MONGODB_URI || process.env.MONGO_URI;
  res.json({
    has_MONGODB_URI: !!process.env.MONGODB_URI,
    has_MONGO_URI: !!process.env.MONGO_URI,
    samplePrefix: mongo ? mongo.slice(0, 18) + '...' : null
  });
});

// Basic error handler (show detail only outside production)
app.use((err, _req, res, _next) => {
  const prod = process.env.NODE_ENV === 'production';
  console.error("Unhandled error", err);
  res.status(500).json({
    error: 'Internal Server Error',
    ...(prod ? {} : { message: err.message, stack: err.stack?.split('\n').slice(0,3) })
  });
});

// Export the Express app (functions as a handler for Vercel)
export default app;
