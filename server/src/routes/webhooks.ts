import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import type { StorageAdapter } from '../types.js';

// Initialize Stripe - lazy initialization to handle missing key
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Webhooks require Stripe to be configured.');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

export function createWebhookRouter(storage: StorageAdapter) {
  const router = Router();

  // Webhook endpoint - must use raw body for signature verification
  router.post('/stripe', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('Missing Stripe signature');
      return res.status(400).send('Missing Stripe signature');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Get Stripe instance
      const stripe = getStripe();
      
      // Verify webhook signature
      // Note: req.body must be the raw body buffer, not parsed JSON
      // This is handled by express.raw() middleware in index.ts
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, storage);
          break;

        case 'payment_intent.processing':
          await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent, storage);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, storage);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      // Still return 200 to prevent Stripe from retrying
      // Log the error for manual investigation
      res.status(500).json({ 
        received: false, 
        error: 'Error processing webhook' 
      });
    }
  });

  return router;
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  storage: StorageAdapter
) {
  console.log('PaymentIntent succeeded:', paymentIntent.id);

  const registrationId = paymentIntent.metadata?.registrationId;
  
  if (!registrationId) {
    console.warn(`PaymentIntent ${paymentIntent.id} has no registrationId in metadata`);
    return;
  }

  try {
    const id = parseInt(registrationId, 10);
    if (isNaN(id)) {
      console.error(`Invalid registrationId in PaymentIntent metadata: ${registrationId}`);
      return;
    }

    // Update registration status to paid
    await storage.updateRegistrationStatus(id, 'paid');
    console.log(`Registration ${id} marked as paid via webhook`);
    
    // TODO: Send confirmation email to customer
    // TODO: Log the sale in analytics
    // TODO: Trigger any other post-payment workflows
  } catch (error) {
    console.error(`Error updating registration ${registrationId} to paid:`, error);
    throw error;
  }
}

/**
 * Handle payment in processing state
 */
async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent,
  storage: StorageAdapter
) {
  console.log('PaymentIntent processing:', paymentIntent.id);

  const registrationId = paymentIntent.metadata?.registrationId;
  
  if (!registrationId) {
    console.warn(`PaymentIntent ${paymentIntent.id} has no registrationId in metadata`);
    return;
  }

  try {
    const id = parseInt(registrationId, 10);
    if (isNaN(id)) {
      console.error(`Invalid registrationId in PaymentIntent metadata: ${registrationId}`);
      return;
    }

    // Payment is processing - keep status as pending
    // Registration will be updated to 'paid' when payment_intent.succeeded is received
    console.log(`Registration ${id} payment is processing`);
    
    // TODO: Send "payment processing" email to customer
    // TODO: Log processing status
  } catch (error) {
    console.error(`Error handling processing status for registration ${registrationId}:`, error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  storage: StorageAdapter
) {
  console.log('PaymentIntent failed:', paymentIntent.id);

  const registrationId = paymentIntent.metadata?.registrationId;
  
  if (!registrationId) {
    console.warn(`PaymentIntent ${paymentIntent.id} has no registrationId in metadata`);
    return;
  }

  try {
    const id = parseInt(registrationId, 10);
    if (isNaN(id)) {
      console.error(`Invalid registrationId in PaymentIntent metadata: ${registrationId}`);
      return;
    }

    // Payment failed - keep status as pending
    // Registration remains pending until payment succeeds
    console.log(`Registration ${id} payment failed`);
    
    // TODO: Send "payment failed" email to customer
    // TODO: Log failed payment attempt
    // TODO: Optionally create a new PaymentIntent for retry
  } catch (error) {
    console.error(`Error handling failed payment for registration ${registrationId}:`, error);
    throw error;
  }
}

