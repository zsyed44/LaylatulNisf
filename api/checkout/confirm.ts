// Confirm checkout - update registration status to paid
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRegistration, updateRegistrationStatus } from '../_lib/registrations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { registrationId } = req.body;

    if (!registrationId || typeof registrationId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required',
      });
    }

    // Check if registration exists
    const registration = await getRegistration(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found',
      });
    }

    // Update registration status to paid
    await updateRegistrationStatus(registrationId, 'paid');

    // Get the updated registration
    const updatedRegistration = await getRegistration(registrationId);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: updatedRegistration,
      message: 'Registration confirmed and marked as paid',
    });
  } catch (error: any) {
    console.error('Error confirming checkout:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm checkout',
    });
  }
}

