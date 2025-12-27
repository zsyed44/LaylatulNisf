// Catch-all serverless function for all /api/* routes
// This handles auth, registrations, checkout, and health endpoints
import app from './_app.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract path from Vercel's catch-all route
    // For /api/checkout/create-payment-intent, req.query.path will be ['checkout', 'create-payment-intent']
    let path = '/';
    
    if (req.query && req.query.path) {
      if (Array.isArray(req.query.path)) {
        path = '/' + req.query.path.join('/');
      } else if (typeof req.query.path === 'string') {
        path = '/' + req.query.path;
      }
    } else if (req.url) {
      // Fallback: extract from URL
      const urlPath = req.url.split('?')[0]; // Remove query string
      path = urlPath.replace(/^\/api/, '') || '/';
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Debug logging (remove in production if needed)
    console.log('Request:', {
      method: req.method,
      url: req.url,
      query: req.query,
      path: path,
    });
    
    // Create Express-compatible request object
    // Vercel's Request/Response are compatible with Express, but we need to set the path correctly
    const expressReq = Object.assign(req, {
      url: path,
      originalUrl: path,
      path: path.split('?')[0],
      baseUrl: '',
      method: req.method || 'GET',
    });
    
    // Clean up query object
    const cleanQuery = { ...req.query };
    delete cleanQuery.path;
    expressReq.query = cleanQuery;
    
    // Call Express app directly - Vercel's Request/Response should work
    return app(expressReq as any, res as any);
  } catch (error: any) {
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}

