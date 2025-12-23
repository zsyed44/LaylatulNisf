import type { StorageAdapter, Registration, RegistrationInput } from '../types.js';

/**
 * Google Sheets Storage Adapter (placeholder implementation)
 * 
 * TODO: Implement Google Sheets API integration
 * - Use googleapis package
 * - Authenticate with service account
 * - Write to configured spreadsheet
 * - Read from spreadsheet
 * 
 * This adapter follows the same interface as SqliteAdapter
 * so switching storage backends is seamless.
 */
export class SheetsAdapter implements StorageAdapter {
  constructor(
    private clientEmail: string,
    private privateKey: string,
    private spreadsheetId: string
  ) {
    // TODO: Initialize Google Sheets API client
    throw new Error('Google Sheets adapter not yet implemented');
  }

  async createRegistration(data: RegistrationInput): Promise<Registration> {
    // TODO: Append row to Google Sheet
    throw new Error('Not implemented');
  }

  async getRegistration(id: number): Promise<Registration | null> {
    // TODO: Read row from Google Sheet by ID
    throw new Error('Not implemented');
  }

  async getAllRegistrations(): Promise<Registration[]> {
    // TODO: Read all rows from Google Sheet
    throw new Error('Not implemented');
  }

  async updateRegistrationStatus(id: number, status: 'pending' | 'paid'): Promise<void> {
    // TODO: Update row status in Google Sheet
    throw new Error('Not implemented');
  }
}

