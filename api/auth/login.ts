// Admin login endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { createToken, getAdminCredentials } from '../_lib/auth.js';

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
    const { username, password } = req.body;

    if (!username || !password) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    const { username: adminUsername, passwordHash } = getAdminCredentials();

    // Verify username
    if (username !== adminUsername) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Verify password
    if (!passwordHash) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: password hash not set',
      });
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = createToken(username, 'admin');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: {
        token,
        username,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to authenticate',
    });
  }
}

