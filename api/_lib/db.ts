// Postgres database connection pool for Vercel serverless
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 1, // Single connection for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export interface RegistrationRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  qty: number;
  dietary: string | null;
  notes: string | null;
  status: 'pending' | 'paid';
  checked_in: boolean;
  created_at: Date;
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  qty: number;
  dietary: string | null;
  notes: string | null;
  status: 'pending' | 'paid';
  checkedIn: boolean;
  createdAt: string; // ISO string
}

// Map database row (snake_case) to API response (camelCase)
export function mapRegistrationRow(row: RegistrationRow): Registration {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    qty: row.qty,
    dietary: row.dietary,
    notes: row.notes,
    status: row.status,
    checkedIn: row.checked_in ?? false,
    createdAt: row.created_at.toISOString(),
  };
}

