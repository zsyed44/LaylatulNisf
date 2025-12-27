# API Restructure Summary

## Overview
Completely restructured the Vercel serverless backend to use explicit file-based routes instead of Express app, removed all dependencies on Express/cors/dotenv, and fixed all TypeScript/build errors.

## File-by-File Changes

### Deleted Files
- `api/_app.ts` - Removed Express app (no longer needed)
- `api/[...path].ts` - Removed catch-all router (replaced with explicit routes)

### New Files Created

#### Shared Libraries (`api/_lib/`)
- `api/_lib/db.ts` - Postgres pool management and row mapping (created_at → createdAt)
- `api/_lib/registrations.ts` - Registration database operations
- `api/_lib/stripe.ts` - Stripe initialization (removed apiVersion to fix type error)
- `api/_lib/auth.ts` - JWT token creation and verification

#### API Endpoints
- `api/health.ts` - Health check endpoint (GET /api/health)
- `api/checkout/create-payment-intent.ts` - Create Stripe PaymentIntent (POST)
- `api/checkout/start.ts` - Start checkout/create registration (POST)
- `api/checkout/confirm.ts` - Confirm checkout/get registration (POST)
- `api/registrations.ts` - Get all registrations (GET, requires auth)
- `api/auth/login.ts` - Admin login (POST)
- `api/auth/verify.ts` - Verify JWT token (GET)
- `api/webhooks/stripe.ts` - Stripe webhook handler (POST, updated)

### Modified Files
- `package.json` - Added dependencies: `bcrypt`, `jsonwebtoken`, `pg` and their types
- `api/webhooks/stripe.ts` - Removed dotenv, updated to use new lib modules
- `README.md` - Added verification section

### Key Fixes

1. **Removed Express/cors/dotenv** - All `/api` files are now standalone serverless functions
2. **Fixed Stripe apiVersion** - Removed apiVersion option to use default (fixes type mismatch)
3. **Fixed Postgres mapping** - Added `mapRegistrationRow()` to convert `created_at` (DB) to `createdAt` (API)
4. **Fixed TypeScript errors** - Created `api/tsconfig.json` with proper ESM config
5. **All responses are JSON** - Every endpoint returns JSON with proper Content-Type headers
6. **OPTIONS preflight handling** - All endpoints handle CORS preflight requests
7. **Error handling** - All endpoints return JSON errors, never empty responses

## Vercel Environment Variables Required

### Required
- `DATABASE_URL` - Neon Postgres connection string
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (build-time)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Your Vercel frontend URL

### Optional
- `STORAGE_MODE` - Default: `postgres` (not used in new structure, kept for compatibility)

## API Endpoints

All endpoints are at `/api/*`:

- `GET /api/health` - Health check
- `POST /api/checkout/create-payment-intent` - Create PaymentIntent
- `POST /api/checkout/start` - Create registration
- `POST /api/checkout/confirm` - Get registration
- `GET /api/registrations` - Get all registrations (requires Bearer token)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/webhooks/stripe` - Stripe webhook

## Build Verification

```bash
npm run build
```
✅ Build succeeds with no TypeScript errors

## Testing

See README.md "Verification" section for curl commands to test endpoints.

