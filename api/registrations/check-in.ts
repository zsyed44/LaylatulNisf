// Update checked-in status for a registration
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRegistration, updateCheckedInStatus } from '../../_lib/registrations.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    try {
      verifyToken(token);
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { registrationId, checkedIn } = req.body;

    if (!registrationId || typeof registrationId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required',
      });
    }

    if (typeof checkedIn !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'checkedIn must be a boolean',
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

    // Update checked-in status
    await updateCheckedInStatus(registrationId, checkedIn);

    // Get the updated registration
    const updatedRegistration = await getRegistration(registrationId);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: updatedRegistration,
      message: `Registration ${checkedIn ? 'checked in' : 'unchecked'}`,
    });
  } catch (error: any) {
    console.error('Error updating checked-in status:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update checked-in status',
    });
  }
}

