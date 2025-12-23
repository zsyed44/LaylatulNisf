import Database from 'better-sqlite3';
import type { StorageAdapter, Registration, RegistrationInput } from '../types.js';

export class SqliteAdapter implements StorageAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        qty INTEGER NOT NULL,
        dietary TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  async createRegistration(data: RegistrationInput): Promise<Registration> {
    const stmt = this.db.prepare(`
      INSERT INTO registrations (name, email, phone, qty, dietary, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      data.name,
      data.email,
      data.phone || null,
      data.qty,
      data.dietary || null,
      data.notes || null
    );

    const registration = this.db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid) as any;
    
    return {
      ...registration,
      createdAt: registration.createdAt || new Date().toISOString()
    };
  }

  async getRegistration(id: number): Promise<Registration | null> {
    const stmt = this.db.prepare('SELECT * FROM registrations WHERE id = ?');
    const row = stmt.get(id) as any;
    return row || null;
  }

  async getAllRegistrations(): Promise<Registration[]> {
    const stmt = this.db.prepare('SELECT * FROM registrations ORDER BY createdAt DESC');
    return stmt.all() as Registration[];
  }

  async updateRegistrationStatus(id: number, status: 'pending' | 'paid'): Promise<void> {
    const stmt = this.db.prepare('UPDATE registrations SET status = ? WHERE id = ?');
    stmt.run(status, id);
  }

  close() {
    this.db.close();
  }
}

