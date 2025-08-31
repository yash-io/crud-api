import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import personRouter from './router/crud.routes.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// router to handle all requests   
app.use('/person', personRouter);

const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (_, res) => {
  res.send('<h1>Person API</h1><p>Use <a href="/person">/person</a> to view people.</p>');
});

app.listen(PORT, () => {
  console.log(`Server is running on localhost port ${PORT}`);
});
