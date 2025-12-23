import { Router } from 'express';
import Stripe from 'stripe';
import { checkoutStartSchema } from '../validation.js';
import type { StorageAdapter } from '../types.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

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

  router.post('/confirm', async (req, res) => {
    try {
      const { registrationId } = req.body;

      if (!registrationId || typeof registrationId !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Registration ID is required',
        });
      }

      // TODO: Verify payment with Stripe webhook/confirmation
      // For now, simulate payment success
      await storage.updateRegistrationStatus(registrationId, 'paid');

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
        message: 'Payment confirmed successfully',
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

