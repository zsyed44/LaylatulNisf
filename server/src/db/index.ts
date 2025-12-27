import { PostgresAdapter } from './postgres-adapter.js';
import { SheetsAdapter } from './sheets-adapter.js';
import type { StorageAdapter } from '../types.js';

export function createStorageAdapter(): StorageAdapter {
  const storageMode = process.env.STORAGE_MODE || 'postgres';

  if (storageMode === 'sheets') {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
      throw new Error('Google Sheets credentials not configured');
    }

    return new SheetsAdapter(clientEmail, privateKey, spreadsheetId);
  }

  // Default to Postgres (Neon)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required. Set it to your Neon Postgres connection string.');
  }

  return new PostgresAdapter(databaseUrl);
}

