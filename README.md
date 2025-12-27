# Laylatul Nisf - Event Registration

A production-style event registration web application for the Laylatul Nisf banquet celebration.

## Project Structure

```
LaylatulNisf/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.ts         # API client functions
│   │   ├── types.ts       # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/            # Database adapters
│   │   ├── routes/        # API routes
│   │   ├── index.ts       # Server entry point
│   │   ├── types.ts       # TypeScript types
│   │   └── validation.ts  # Zod schemas
│   ├── data/              # SQLite database (created on first run)
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Root scripts
└── README.md
```

## Features

- ✅ Clean, elegant UI with Shia-decor inspired design (gold accents, subtle patterns)
- ✅ Mobile-responsive layout
- ✅ Event registration form with validation
- ✅ SQLite database storage (with extensible storage adapter pattern)
- ✅ Stripe-ready payment flow (simulated for now)
- ✅ Admin endpoints for viewing registrations
- ✅ Success receipt screen
- ✅ FAQ section
- ✅ Event details and hero section

## Prerequisites

- Node.js 18+ and npm
- Neon Postgres database (free tier available at https://neon.tech)

## Setup Instructions

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

This will install dependencies for the root, server, and client.

### 2. Set Up Neon Postgres Database

1. Create a free account at https://neon.tech
2. Create a new project
3. Copy your connection string (format: `postgresql://user:password@host/database?sslmode=require`)
4. Run the schema to create tables:

```bash
# Using psql (if installed)
psql "your-connection-string" -f db/schema.sql

# Or using Neon's SQL editor in the dashboard
# Copy and paste the contents of db/schema.sql
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - Your Neon Postgres connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key (test keys for development)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_PASSWORD_HASH` - Generate using: `npx tsx server/src/scripts/generate-password-hash.ts`
- `JWT_SECRET` - Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Run the Application

From the root directory:

```bash
npm run dev
```

This starts both the server (port 3001) and client (port 5173) concurrently.

Alternatively, run them separately:

```bash
# Terminal 1: Server
npm run dev:server

# Terminal 2: Client
npm run dev:client
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

## API Endpoints

### Registration & Checkout

- `POST /api/checkout/start` - Start checkout (creates registration)
  - Body: `{ name, email, phone?, qty, dietary?, notes?, consent }`
  - Returns: `{ registrationId, checkoutUrl, clientSecret }`

- `POST /api/checkout/confirm` - Confirm payment (simulated)
  - Body: `{ registrationId }`
  - Returns: Updated registration with `status: 'paid'`

### Admin Endpoints

- `GET /api/health` - Health check (returns `{ ok: true }`)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/registrations` - List all registrations (protected, requires JWT)
- `GET /api/registrations/:id` - Get specific registration (protected, requires JWT)
- `POST /api/checkout/create-payment-intent` - Create Stripe PaymentIntent
- `POST /api/webhooks/stripe` - Stripe webhook endpoint

## Database Schema

The `registrations` table (Postgres) includes:

- `id` (SERIAL PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `email` (TEXT NOT NULL)
- `phone` (TEXT, nullable)
- `qty` (INTEGER NOT NULL)
- `dietary` (TEXT, nullable)
- `notes` (TEXT, nullable)
- `status` (TEXT: 'pending' | 'paid', default 'pending')
- `created_at` (TIMESTAMP WITH TIME ZONE, default NOW())

See `db/schema.sql` for the full schema with indexes.

## Storage Adapters

The application uses a storage adapter pattern for flexibility:

- **PostgresAdapter** (default): Stores data in Neon Postgres
- **SheetsAdapter** (optional): Google Sheets integration

To switch storage backends, set `STORAGE_MODE=sheets` in `.env` and configure Google Sheets credentials.

## Future Integrations

### Stripe Payment Integration

The checkout flow is designed to easily integrate Stripe:

1. In `server/src/routes/checkout.ts`, replace the placeholder in `/start` with:
   ```typescript
   const session = await stripe.checkout.sessions.create({
     // Stripe configuration
   });
   ```

2. Add Stripe webhook handler for payment confirmation
3. Update frontend to redirect to Stripe checkout or use Stripe Elements

### Google Sheets Integration

1. Install `googleapis` package
2. Implement methods in `server/src/db/sheets-adapter.ts`
3. Set `STORAGE_MODE=sheets` in `.env`
4. Configure Google Sheets credentials

### Authentication

Add authentication middleware to admin routes:

```typescript
// Example: Add to server/src/routes/registrations.ts
router.use(authenticateAdmin);
```

## Development

### Building for Production

```bash
# Build client
npm run build

# Build server
cd server
npm run build
```

## Deployment to Vercel

### Prerequisites
- Vercel account
- Neon Postgres database (same as local dev)

### Steps

1. **Push code to GitHub**

2. **Import project to Vercel**
   - Framework Preset: **Vite**
   - Root Directory: (leave empty)

3. **Add Environment Variables in Vercel Dashboard:**
   - `DATABASE_URL` - Your Neon Postgres connection string
   - `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for frontend build)
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `ADMIN_USERNAME` - Admin username (default: "admin")
   - `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
   - `JWT_SECRET` - JWT signing secret
   - `CLIENT_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

4. **Deploy**

5. **Configure Stripe Webhook:**
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.payment_failed`

### Verification Steps

After deployment, verify the backend is working:

1. **Health Check:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   Expected: `{"ok":true}`

2. **Test PaymentIntent Creation:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/checkout/create-payment-intent \
     -H "Content-Type: application/json" \
     -d '{"amount": 6000, "currency": "cad"}'
   ```
   Expected: `{"success":true,"data":{"clientSecret":"pi_...","paymentIntentId":"pi_..."}}`
   Note: Amount is in smallest currency unit (6000 = $60.00 CAD)

3. **Frontend Tests:**
   - [ ] Payment system initializes (no "Unexpected end of JSON input" error)
   - [ ] Payment form loads without hanging
   - [ ] Submit test registration form
   - [ ] Check admin page (login with credentials)
   - [ ] Verify registration appears in admin view

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript (Vercel Serverless Functions)
- **Database:** Neon Postgres (pg driver)
- **Validation:** Zod
- **Styling:** Tailwind CSS with custom gold color palette

## Verification

After deployment to Vercel, verify the backend is working:

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```
Expected response: `{"ok":true}`

### 2. Test PaymentIntent Creation
```bash
curl -X POST https://your-app.vercel.app/api/checkout/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 60, "currency": "cad"}'
```
Expected response: `{"success":true,"data":{"clientSecret":"pi_...","paymentIntentId":"pi_..."}}`
Note: Amount is in dollars (60 = $60.00). Backend converts to cents automatically.

### 3. Webhook URL
Configure in Stripe Dashboard:
- URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.payment_failed`

### 4. Required Environment Variables (Vercel)
- `DATABASE_URL` - Neon Postgres connection string
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (build-time)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD_HASH` - bcrypt hash of admin password
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Your Vercel frontend URL

## License

ISC

