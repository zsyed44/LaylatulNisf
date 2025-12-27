// Catch-all serverless function for all /api/* routes
// This handles auth, registrations, checkout, and health endpoints
import app from './_app.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Vercel passes the path segments in req.query
    // For /api/checkout/create-payment-intent, req.query will have the path segments
    let path = '/';
    
    if (req.query.path) {
      // Handle array of path segments (e.g., ['checkout', 'create-payment-intent'])
      if (Array.isArray(req.query.path)) {
        path = '/' + req.query.path.join('/');
      } else {
        path = '/' + req.query.path;
      }
    } else if (req.url) {
      // Fallback to req.url if query.path is not available
      path = req.url.replace(/^\/api/, '') || '/';
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Create Express-compatible request object
    const expressReq = {
      method: req.method || 'GET',
      url: path,
      originalUrl: path,
      path: path.split('?')[0], // Remove query string from path
      headers: req.headers || {},
      body: req.body,
      query: { ...req.query },
      params: {},
      // Remove path from query to avoid conflicts
    } as any;
    
    // Remove path from query object
    delete expressReq.query.path;
    
    // Handle Express app
    return app(expressReq, res as any);
  } catch (error: any) {
    // Ensure we always return JSON, even on unexpected errors
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}

