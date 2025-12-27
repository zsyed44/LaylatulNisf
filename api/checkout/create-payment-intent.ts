// Create Stripe PaymentIntent endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../_lib/stripe.js';

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
    const { amount, currency = 'usd', registrationId, metadata } = req.body;

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be a positive number',
      });
    }

    // Validate currency
    if (typeof currency !== 'string' || currency.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Currency must be a valid 3-letter currency code (e.g., "usd")',
      });
    }

    // Prepare metadata
    const paymentMetadata: Record<string, string> = {
      ...(metadata || {}),
    };

    if (registrationId) {
      paymentMetadata.registrationId = String(registrationId);
    }

    // Get Stripe instance
    const stripe = getStripe();

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return client secret
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid payment request',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create PaymentIntent',
    });
  }
}

