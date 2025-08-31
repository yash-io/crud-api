// api/index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "../db/db.js";
import personRouter from "../router/crud.routes.js";
import serverless from "serverless-http";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// router to handle all requests
app.use("/person", personRouter);

connectDB();

// Root test route
app.get("/", (_, res) => {
  res.send(
    '<h1>Person API</h1><p>Use <a href="/person">/person</a> to view people.</p>'
  );
});

// export handler instead
export const handler = serverless(app);
