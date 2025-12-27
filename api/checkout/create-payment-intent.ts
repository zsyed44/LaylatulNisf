// Create Stripe PaymentIntent endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../_lib/stripe.js';

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

    const { amount, currency = 'cad', registrationId, metadata } = req.body;

    // Validate amount: must be number > 0 (will be converted to smallest currency unit)
    if (typeof amount !== 'number' || amount <= 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        error: 'Amount is required and must be a positive number',
        code: 'INVALID_AMOUNT',
        type: 'validation_error',
      });
    }

    // Validate currency
    if (typeof currency !== 'string' || currency.length !== 3) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        error: 'Currency must be a valid 3-letter currency code (e.g., "cad")',
        code: 'INVALID_CURRENCY',
        type: 'validation_error',
      });
    }

    // Prepare metadata
    const paymentMetadata: Record<string, string> = {
      ...(metadata || {}),
    };

    if (registrationId) {
      paymentMetadata.registrationId = String(registrationId);
    }

    // Get Stripe instance (will throw if STRIPE_SECRET_KEY is missing)
    const stripe = getStripe();

    // Create PaymentIntent
    // Frontend sends amount in dollars (e.g., 60), convert to smallest currency unit (cents)
    const amountInCents = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Convert dollars to cents
      currency: currency.toLowerCase(),
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return client secret (matching frontend expected format)
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
    res.setHeader('Content-Type', 'application/json');

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeAPIError') {
      return res.status(400).json({
        error: error.message || 'Invalid payment request',
        code: error.code || 'STRIPE_ERROR',
        type: error.type || 'stripe_error',
      });
    }

    // Handle missing STRIPE_SECRET_KEY
    if (error.message && error.message.includes('STRIPE_SECRET_KEY')) {
      return res.status(500).json({
        error: 'Payment system configuration error',
        code: 'CONFIG_ERROR',
        type: 'server_error',
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to create PaymentIntent',
      code: 'INTERNAL_ERROR',
      type: 'server_error',
    });
  }
}

