// Shared Express app for Vercel serverless functions
// This app is used by all serverless functions to maintain consistency
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createStorageAdapter } from '../server/src/db/index.js';
import { createRegistrationsRouter } from '../server/src/routes/registrations.js';
import { createCheckoutRouter } from '../server/src/routes/checkout.js';
import authRouter from '../server/src/routes/auth.js';

dotenv.config();

const app = express();

// Initialize storage adapter (singleton pattern for serverless)
let storage: ReturnType<typeof createStorageAdapter> | null = null;
function getStorage() {
  if (!storage) {
    storage = createStorageAdapter();
  }
  return storage;
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// JSON body parser for routes that need it (webhook handles raw body separately)
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/registrations', createRegistrationsRouter(getStorage()));
app.use('/checkout', createCheckoutRouter(getStorage()));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

export default app;

