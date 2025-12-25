import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createStorageAdapter } from './db/index.js';
import { createRegistrationsRouter } from './routes/registrations.js';
import { createCheckoutRouter } from './routes/checkout.js';
import { createWebhookRouter } from './routes/webhooks.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize storage adapter
const storage = createStorageAdapter();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Webhook endpoint must use raw body for Stripe signature verification
// This route must be registered BEFORE express.json() middleware
const webhookRouter = createWebhookRouter(storage);
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  webhookRouter
);

// JSON body parser for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/registrations', createRegistrationsRouter(storage));
app.use('/api/checkout', createCheckoutRouter(storage));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

