import { createStorageAdapter } from './index.js';

// Initialize database by creating the adapter
// This will create tables if they don't exist
const adapter = createStorageAdapter();
console.log('Database initialized successfully');
process.exit(0);

