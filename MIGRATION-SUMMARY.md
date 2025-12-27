# Migration Summary: SQLite → Neon Postgres

## Changes Made

### 1. Removed SQLite Dependencies
- **Removed from `server/package.json`:**
  - `better-sqlite3` (native module causing Vercel build failures)
  - `@types/better-sqlite3`

- **Added to `server/package.json`:**
  - `pg` (Postgres driver - pure JavaScript)
  - `@types/pg`

### 2. Created Postgres Adapter
- **New file:** `server/src/db/postgres-adapter.ts`
  - Implements `StorageAdapter` interface
  - Uses `pg` Pool for connection management (serverless-friendly)
  - All methods match existing interface (no API changes)

### 3. Updated Database Factory
- **Modified:** `server/src/db/index.ts`
  - Default storage mode changed from `sqlite` to `postgres`
  - Now requires `DATABASE_URL` environment variable
  - Returns `PostgresAdapter` by default

### 4. Created Database Schema
- **New file:** `db/schema.sql`
  - Postgres CREATE TABLE statement
  - Includes indexes for performance
  - Compatible with Neon Postgres

### 5. Updated Environment Variables
- **New file:** `.env.example` (root)
- **Updated:** `server/.env.example`
  - Changed `DATABASE_URL` format to Postgres connection string
  - Changed `STORAGE_MODE` default to `postgres`

### 6. Updated API Health Endpoint
- **Modified:** `api/_app.ts`
  - Health endpoint now returns `{ ok: true }` (as requested)

### 7. Updated Documentation
- **Modified:** `README.md`
  - Updated setup instructions for Neon Postgres
  - Added Vercel deployment guide
  - Updated database schema documentation
  - Added smoke test checklist

## Files Changed

### New Files
- `server/src/db/postgres-adapter.ts` - Postgres implementation
- `db/schema.sql` - Postgres schema
- `.env.example` - Root environment template
- `MIGRATION-SUMMARY.md` - This file

### Modified Files
- `server/package.json` - Removed better-sqlite3, added pg
- `server/src/db/index.ts` - Now uses PostgresAdapter by default
- `server/.env.example` - Updated for Postgres
- `api/_app.ts` - Health endpoint returns `{ ok: true }`
- `README.md` - Updated deployment instructions

### Unchanged (but no longer used in production)
- `server/src/db/sqlite-adapter.ts` - Still exists but not imported by API functions
  - Safe to keep for reference or future local-only use
  - Not imported in `/api` code path, so Vercel won't try to build it

## Verification

✅ **API functions don't import SQLite:**
- `api/_app.ts` imports `createStorageAdapter()` which returns `PostgresAdapter`
- `api/webhooks/stripe.ts` imports `createStorageAdapter()` which returns `PostgresAdapter`
- No direct imports of `sqlite-adapter.ts` in `/api` folder

✅ **Dependencies verified:**
- `better-sqlite3` removed from `server/package.json`
- `pg` added (pure JavaScript, no native compilation)
- Install command tested successfully

## Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required
- `DATABASE_URL` - Neon Postgres connection string
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for frontend build)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Your Vercel frontend URL

### Optional
- `STORAGE_MODE` - Default: `postgres` (can be `sheets` for Google Sheets)

## Deploy Checklist

1. **Set up Neon Postgres:**
   - [ ] Create account at https://neon.tech
   - [ ] Create new project
   - [ ] Copy connection string
   - [ ] Run `db/schema.sql` in Neon SQL editor

2. **Push code to GitHub:**
   - [ ] Commit all changes
   - [ ] Push to repository

3. **Deploy to Vercel:**
   - [ ] Import project (Framework: Vite)
   - [ ] Add all environment variables (see list above)
   - [ ] Deploy

4. **Configure Stripe Webhook:**
   - [ ] Add webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - [ ] Select events: `payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.payment_failed`
   - [ ] Copy webhook signing secret to Vercel env vars

5. **Smoke Tests:**
   - [ ] Visit `https://your-app.vercel.app/api/health` → Should return `{ ok: true }`
   - [ ] Submit test registration form
   - [ ] Check admin page (login with credentials)
   - [ ] Verify registration appears in admin view

## Local Development

Local development still works the same way:

```bash
# Install dependencies
npm run install:all

# Set up .env file (copy from .env.example)
cp .env.example .env
# Edit .env and set DATABASE_URL to your Neon connection string

# Run schema on Neon (via Neon dashboard SQL editor)
# Copy contents of db/schema.sql and run it

# Start dev servers
npm run dev
```

The only difference: you need a Neon Postgres database instead of a local SQLite file.

