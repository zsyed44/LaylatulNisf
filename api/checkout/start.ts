// Start checkout - create registration
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRegistration } from '../_lib/registrations.js';

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
    const { name, email, phone, qty, dietary, notes, consent } = req.body;

    // Basic validation
    if (!name || !email || !qty || consent !== true) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, qty, and consent are required',
      });
    }

    if (typeof qty !== 'number' || qty < 1 || qty > 10) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be between 1 and 10',
      });
    }

    // Create registration with pending status
    const registration = await createRegistration({
      name,
      email,
      phone,
      qty,
      dietary,
      notes,
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: {
        registrationId: registration.id,
        checkoutUrl: null,
        clientSecret: null,
        message: 'Registration created successfully',
      },
    });
  } catch (error: any) {
    console.error('Error starting checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start checkout',
    });
  }
}

