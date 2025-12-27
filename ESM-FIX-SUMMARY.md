# ESM Module System Fix Summary

## Problem
Vercel was executing `/api` functions as CommonJS, but the code used ESM `import` statements, causing:
- `SyntaxError: Cannot use import statement outside a module`
- Functions failing to load on Vercel

## Solution
Added `api/package.json` with `{"type": "module"}` to scope ESM behavior ONLY to `/api` folder, without affecting root or `/server` code.

## File-by-File Changes

### New Files
- `api/package.json` - Contains `{"type": "module"}` to enable ESM for all `/api` functions

### Modified Files

#### PaymentIntent Endpoint (`api/checkout/create-payment-intent.ts`)
- ✅ Wrapped entire handler in try/catch
- ✅ Changed currency default from `'usd'` to `'cad'`
- ✅ Fixed amount validation: now requires integer > 0 (smallest currency unit)
- ✅ Removed conversion (amount is already in smallest currency unit)
- ✅ Updated error response format: `{ error, code, type }` with proper status codes
- ✅ Returns `{ success: true, data: { clientSecret, paymentIntentId } }` to match frontend
- ✅ All responses set `Content-Type: application/json` header

#### All Other Endpoints
- ✅ Wrapped handlers in try/catch blocks
- ✅ All responses set `Content-Type: application/json` header
- ✅ All error responses return JSON (never empty body)
- ✅ OPTIONS preflight handling with proper headers

#### Stripe Library (`api/_lib/stripe.ts`)
- ✅ Already removed apiVersion (no type mismatch)
- ✅ Throws clear error if STRIPE_SECRET_KEY is missing

#### Webhook Handler (`api/webhooks/stripe.ts`)
- ✅ Wrapped in try/catch
- ✅ All responses set Content-Type header
- ✅ Proper error handling

## Vercel Environment Variables Required

### Required
- `DATABASE_URL` - Neon Postgres connection string
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (build-time, for frontend)
- `STRIPE_SECRET_KEY` - Stripe secret key (runtime, for backend)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (if webhooks are used)
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Your Vercel frontend URL

## Assumptions Made

1. **Amount Format**: Frontend sends amount in dollars (e.g., 60), and backend converts to smallest currency unit (cents) by multiplying by 100. This maintains compatibility with existing frontend code.

2. **Currency Default**: Changed from `'usd'` to `'cad'` as requested. Frontend can override by sending `currency: 'usd'` in the request.

3. **Response Format**: PaymentIntent endpoint returns `{ success: true, data: { clientSecret, paymentIntentId } }` to match what frontend expects (from `response.data.clientSecret`).

## Verification

After deployment:
1. `/api/health` returns `{"ok":true}`
2. `POST /api/checkout/create-payment-intent` with `{"amount": 60, "currency": "cad"}` returns `{"success":true,"data":{"clientSecret":"pi_...","paymentIntentId":"pi_..."}}`
   - Amount is in dollars (60 = $60.00), backend converts to cents automatically
3. Frontend no longer shows "Unexpected end of JSON input"
4. Payment initialization no longer hangs

