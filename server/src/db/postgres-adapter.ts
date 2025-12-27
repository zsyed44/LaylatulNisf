import { Pool, QueryResult } from 'pg';
import type { StorageAdapter, Registration, RegistrationInput } from '../types.js';

export class PostgresAdapter implements StorageAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      // Serverless-friendly: use connection pooling
      max: 1, // Single connection for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async createRegistration(data: RegistrationInput): Promise<Registration> {
    const query = `
      INSERT INTO registrations (name, email, phone, qty, dietary, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, name, email, phone, qty, dietary, notes, status, created_at
    `;

    const result: QueryResult<Registration> = await this.pool.query(query, [
      data.name,
      data.email,
      data.phone || null,
      data.qty,
      data.dietary || null,
      data.notes || null,
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      qty: row.qty,
      dietary: row.dietary,
      notes: row.notes,
      status: row.status as 'pending' | 'paid',
      createdAt: row.created_at.toISOString(),
    };
  }

  async getRegistration(id: number): Promise<Registration | null> {
    const query = 'SELECT * FROM registrations WHERE id = $1';
    const result: QueryResult<Registration> = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      qty: row.qty,
      dietary: row.dietary,
      notes: row.notes,
      status: row.status as 'pending' | 'paid',
      createdAt: row.created_at.toISOString(),
    };
  }

  async getAllRegistrations(): Promise<Registration[]> {
    const query = 'SELECT * FROM registrations ORDER BY created_at DESC';
    const result: QueryResult<Registration> = await this.pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      qty: row.qty,
      dietary: row.dietary,
      notes: row.notes,
      status: row.status as 'pending' | 'paid',
      createdAt: row.created_at.toISOString(),
    }));
  }

  async updateRegistrationStatus(id: number, status: 'pending' | 'paid'): Promise<void> {
    const query = 'UPDATE registrations SET status = $1 WHERE id = $2';
    await this.pool.query(query, [status, id]);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

