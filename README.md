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
- SQLite3 (usually comes with Node.js)

## Setup Instructions

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

This will install dependencies for the root, server, and client.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if needed (defaults should work for local development).

### 3. Initialize Database

```bash
cd server
npm run init-db
cd ..
```

This creates the SQLite database and tables.

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

- `GET /api/registrations` - List all registrations
- `GET /api/registrations/:id` - Get specific registration

**Note:** Admin endpoints currently have no authentication. Add authentication middleware before production use (see TODO comments in code).

## Database Schema

The `registrations` table includes:

- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT, nullable)
- `qty` (INTEGER)
- `dietary` (TEXT, nullable)
- `notes` (TEXT, nullable)
- `status` (TEXT: 'pending' | 'paid')
- `createdAt` (TEXT: ISO datetime)

## Storage Adapters

The application uses a storage adapter pattern for flexibility:

- **SqliteAdapter** (default): Stores data in SQLite
- **SheetsAdapter** (placeholder): Future Google Sheets integration

To switch storage backends, set `STORAGE_MODE=sheets` in `.env` and configure Google Sheets credentials (not yet implemented).

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

### Database Location

SQLite database is stored at: `server/data/registrations.db` (created automatically)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (better-sqlite3)
- **Validation:** Zod
- **Styling:** Tailwind CSS with custom gold color palette

## License

ISC

