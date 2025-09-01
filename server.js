import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import personRouter from "./router/crud.routes.js";

dotenv.config();

// Kick off an initial (non-blocking) connection attempt
connectDB().catch(err => {
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

app.get('/health', async (_req, res) => {
  const mongoState = (await import('mongoose')).default.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  res.json({ status: 'ok', mongoState });
});

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the Express app (functions as a handler for Vercel)
export default app;
