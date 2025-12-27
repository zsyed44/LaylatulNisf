// Health check endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'GET') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Error in health check:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Internal server error' });
  }
}

