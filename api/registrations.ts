// Get all registrations (admin only)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllRegistrations } from './_lib/registrations.js';
import { verifyToken } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    verifyToken(token); // Throws if invalid

    // Get all registrations
    const registrations = await getAllRegistrations();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch registrations',
    });
  }
}

