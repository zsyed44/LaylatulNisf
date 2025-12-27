// Stripe initialization and helpers
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    // Remove apiVersion to use default (avoids type mismatch)
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}

