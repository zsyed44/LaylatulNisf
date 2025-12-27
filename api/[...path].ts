// Catch-all serverless function for all /api/* routes
// This handles auth, registrations, checkout, and health endpoints
import app from './_app.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Remove /api prefix from path for Express routing
  const originalUrl = req.url || '';
  const path = originalUrl.replace(/^\/api/, '') || '/';
  
  // Update req.url for Express routing
  req.url = path;
  
  // Handle Express app
  return app(req as any, res as any);
}

