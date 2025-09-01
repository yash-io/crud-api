import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import personRouter from "./router/crud.routes.js";

dotenv.config();

// Ensure DB connected (cached in connectDB)
connectDB().catch(err => {
  console.error("Failed initial DB connection", err);
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/person", personRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", endpoints: ["GET /person", "POST /person", "GET /person/:id", "PUT /person/:id", "DELETE /person/:id"] });
});

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the Express app (functions as a handler for Vercel)
export default app;
