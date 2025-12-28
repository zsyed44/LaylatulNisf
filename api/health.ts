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

    // Check Stripe key mode for debugging
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const secretKeyMode = secretKey.startsWith('sk_test_') ? 'TEST' : 
                         secretKey.startsWith('sk_live_') ? 'LIVE' : 
                         'UNKNOWN';
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      ok: true,
      stripe: {
        secretKeyMode,
        hasSecretKey: !!secretKey,
      }
    });
  } catch (error: any) {
    console.error('Error in health check:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Internal server error' });
  }
}

