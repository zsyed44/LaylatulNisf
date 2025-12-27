// Vercel serverless function for /api/webhooks/stripe
// This needs raw body handling for Stripe signature verification
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createStorageAdapter } from '../../server/src/db/index.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Initialize storage adapter
let storage: ReturnType<typeof createStorageAdapter> | null = null;
function getStorage() {
  if (!storage) {
    storage = createStorageAdapter();
  }
  return storage;
}

// Initialize Stripe
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Webhooks require Stripe to be configured.');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

// Import webhook handlers
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  storage: ReturnType<typeof createStorageAdapter>
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
    await storage.updateRegistrationStatus(id, 'paid');
    console.log(`Registration ${id} marked as paid via webhook`);
  } catch (error) {
    console.error(`Error updating registration ${registrationId} to paid:`, error);
    throw error;
  }
}

async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent,
  storage: ReturnType<typeof createStorageAdapter>
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
    console.log(`Registration ${id} payment is processing`);
  } catch (error) {
    console.error(`Error handling processing status for registration ${registrationId}:`, error);
    throw error;
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  storage: ReturnType<typeof createStorageAdapter>
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
    console.log(`Registration ${id} payment failed`);
  } catch (error) {
    console.error(`Error handling failed payment for registration ${registrationId}:`, error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('Missing Stripe signature');
    return res.status(400).send('Missing Stripe signature');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(500).send('Webhook secret not configured');
  }

  // Get raw body - Vercel provides it as a string or Buffer
  let rawBody: Buffer;
  if (typeof req.body === 'string') {
    rawBody = Buffer.from(req.body, 'utf8');
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body;
  } else {
    // If body was parsed as JSON, we need to reconstruct it
    // This shouldn't happen if bodyParser is disabled, but handle it anyway
    rawBody = Buffer.from(JSON.stringify(req.body), 'utf8');
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    const storageInstance = getStorage();
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, storageInstance);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent, storageInstance);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, storageInstance);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ 
      received: false, 
      error: 'Error processing webhook' 
    });
  }
}

// Disable body parsing for this route - Vercel will pass raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
