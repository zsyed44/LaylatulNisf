import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createStorageAdapter } from './db/index.js';
import { createRegistrationsRouter } from './routes/registrations.js';
import { createCheckoutRouter } from './routes/checkout.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Initialize storage adapter
const storage = createStorageAdapter();

// Routes
app.use('/api/registrations', createRegistrationsRouter(storage));
app.use('/api/checkout', createCheckoutRouter(storage));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

