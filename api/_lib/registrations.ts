// Registration database operations
import { getDbPool, mapRegistrationRow, type Registration, type RegistrationRow } from './db.js';

export interface RegistrationInput {
  name: string;
  email: string;
  phone?: string;
  qty: number;
  dietary?: string;
  notes?: string;
}

export async function createRegistration(data: RegistrationInput): Promise<Registration> {
  const pool = getDbPool();
  const query = `
    INSERT INTO registrations (name, email, phone, qty, dietary, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING id, name, email, phone, qty, dietary, notes, status, checked_in, created_at
  `;

  const result = await pool.query<RegistrationRow>(query, [
    data.name,
    data.email,
    data.phone || null,
    data.qty,
    data.dietary || null,
    data.notes || null,
  ]);

  return mapRegistrationRow(result.rows[0]);
}

export async function getRegistration(id: number): Promise<Registration | null> {
  const pool = getDbPool();
  const query = 'SELECT * FROM registrations WHERE id = $1';
  const result = await pool.query<RegistrationRow>(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRegistrationRow(result.rows[0]);
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const pool = getDbPool();
  const query = 'SELECT * FROM registrations ORDER BY created_at DESC';
  const result = await pool.query<RegistrationRow>(query);

  return result.rows.map(mapRegistrationRow);
}

export async function updateRegistrationStatus(id: number, status: 'pending' | 'paid'): Promise<void> {
  const pool = getDbPool();
  const query = 'UPDATE registrations SET status = $1 WHERE id = $2';
  await pool.query(query, [status, id]);
}

export async function updateCheckedInStatus(id: number, checkedIn: boolean): Promise<void> {
  const pool = getDbPool();
  const query = 'UPDATE registrations SET checked_in = $1 WHERE id = $2';
  await pool.query(query, [checkedIn, id]);
}

