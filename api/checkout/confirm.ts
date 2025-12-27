// Confirm checkout - get registration
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRegistration } from '../_lib/registrations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { registrationId } = req.body;

    if (!registrationId || typeof registrationId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required',
      });
    }

    const registration = await getRegistration(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found',
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: registration,
      message: 'Registration confirmed',
    });
  } catch (error: any) {
    console.error('Error confirming checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm checkout',
    });
  }
}

