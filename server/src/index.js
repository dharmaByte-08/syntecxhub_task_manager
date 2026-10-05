import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { seedDemo } from './seed.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-only-task-manager-secret';
  console.log('JWT_SECRET is not set. Using a development secret. Set JWT_SECRET before deploying.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'task-manager' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

app.use((err, _req, res, _next) => {
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 5001;
const { memory } = await connectDB('taskmanager');
await seedDemo(memory);
app.listen(port, () => {
  console.log(`Task manager API listening on http://localhost:${port}`);
});
