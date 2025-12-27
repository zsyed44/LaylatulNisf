// Stripe webhook endpoint - handles payment events
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripe } from '../_lib/stripe.js';
import { updateRegistrationStatus } from '../_lib/registrations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('Missing Stripe signature');
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get raw body - Vercel provides it as a string or Buffer
  let rawBody: Buffer;
  if (typeof req.body === 'string') {
    rawBody = Buffer.from(req.body, 'utf8');
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body;
  } else {
    // If body was parsed as JSON, we need to reconstruct it
    rawBody = Buffer.from(JSON.stringify(req.body || {}), 'utf8');
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({
      received: false,
      error: error.message || 'Error processing webhook',
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
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
    await updateRegistrationStatus(id, 'paid');
    console.log(`Registration ${id} marked as paid via webhook`);
  } catch (error) {
    console.error(`Error updating registration ${registrationId} to paid:`, error);
    throw error;
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
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

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
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

// Disable body parsing for this route - Vercel will pass raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
