# Vercel Deployment Guide

This project is configured to deploy on Vercel with:
- **Frontend**: Vite/React app in `/client` (deployed as main site)
- **Backend**: Express routes converted to Vercel Serverless Functions in `/api`

## Vercel Configuration

When deploying to Vercel:

1. **Framework Preset**: Select **Vite**
2. **Root Directory**: Leave empty (or set to project root)
3. **Build Command**: `cd client && npm install && npm run build` (auto-configured in vercel.json)
4. **Output Directory**: `client/dist` (auto-configured in vercel.json)
5. **Install Command**: `npm run install:all` (auto-configured in vercel.json)

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Client (Build-time)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Server (Runtime)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_USERNAME` - Admin username (default: "admin")
- `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
- `JWT_SECRET` - Secret for JWT token signing
- `DATABASE_URL` - Path to SQLite database (e.g., `/tmp/registrations.db` for serverless)
- `STORAGE_MODE` - Storage mode: "sqlite" or "sheets" (default: "sqlite")
- `CLIENT_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### Database Note for Serverless

SQLite files in serverless functions are ephemeral. For production, consider:
- Using Vercel's serverless database (Postgres)
- Using Google Sheets adapter (`STORAGE_MODE=sheets`)
- Using an external database service

## Local Development

Local development still works as before:

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3001
```

The server still runs as a traditional Express server locally (`server/src/index.ts`), while Vercel uses the serverless functions in `/api`.

## API Routes

All API routes are available at `/api/*`:
- `/api/auth/login` - Admin login
- `/api/auth/verify` - Verify JWT token
- `/api/registrations` - Get all registrations (protected)
- `/api/registrations/:id` - Get specific registration (protected)
- `/api/checkout/create-payment-intent` - Create Stripe PaymentIntent
- `/api/checkout/start` - Start checkout process
- `/api/checkout/confirm` - Confirm checkout
- `/api/webhooks/stripe` - Stripe webhook endpoint
- `/api/health` - Health check

## Webhook Configuration

For Stripe webhooks, configure the endpoint in Stripe Dashboard:
- URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.payment_failed`

