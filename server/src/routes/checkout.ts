import { Router } from 'express';
import Stripe from 'stripe';
import { checkoutStartSchema } from '../validation.js';
import type { StorageAdapter } from '../types.js';

// Initialize Stripe - lazy initialization to handle missing key
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

export function createCheckoutRouter(storage: StorageAdapter) {
  const router = Router();

  router.post('/start', async (req, res) => {
    try {
      const validated = checkoutStartSchema.parse(req.body);

      // Create registration with pending status
      const registration = await storage.createRegistration({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        qty: validated.qty,
        dietary: validated.dietary,
        notes: validated.notes,
      });

      // TODO: Integrate Stripe Checkout Session creation here
      // const session = await stripe.checkout.sessions.create({...});
      // return { checkoutUrl: session.url, clientSecret: null };

      // For now, return placeholder response
      res.json({
        success: true,
        data: {
          registrationId: registration.id,
          checkoutUrl: null, // Will be Stripe checkout URL
          clientSecret: null, // Will be Stripe client secret for payment element
          message: 'Registration created. Payment integration pending.',
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }

      console.error('Error starting checkout:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start checkout',
      });
    }
  });

  // Create PaymentIntent endpoint
  router.post('/create-payment-intent', async (req, res) => {
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
      if (!stripe) {
        return res.status(500).json({
          success: false,
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
        });
      }

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
      res.json({
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
        error: 'Failed to create PaymentIntent',
      });
    }
  });

  // Link PaymentIntent with registration
  router.post('/link-payment-intent', async (req, res) => {
    try {
      const { paymentIntentId, registrationId } = req.body;

      if (!paymentIntentId || typeof paymentIntentId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'PaymentIntent ID is required',
        });
      }

      if (!registrationId || typeof registrationId !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Registration ID is required',
        });
      }

      // Get Stripe instance
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({
          success: false,
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
        });
      }

      // Update PaymentIntent metadata with registrationId
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          registrationId: String(registrationId),
        },
      });

      res.json({
        success: true,
        message: 'PaymentIntent linked to registration',
      });
    } catch (error: any) {
      console.error('Error linking PaymentIntent:', error);
      
      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
          success: false,
          error: error.message || 'Invalid PaymentIntent',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to link PaymentIntent',
      });
    }
  });

  router.post('/confirm', async (req, res) => {
    try {
      const { registrationId } = req.body;

      if (!registrationId || typeof registrationId !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Registration ID is required',
        });
      }

      // Note: Payment status is now handled by webhooks
      // This endpoint is kept for backward compatibility
      // The webhook will update the registration status when payment succeeds
      const registration = await storage.getRegistration(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found',
        });
      }

      res.json({
        success: true,
        data: registration,
        message: 'Registration confirmed. Payment status will be updated via webhook.',
      });
    } catch (error) {
      console.error('Error confirming checkout:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm checkout',
      });
    }
  });

  return router;
}

