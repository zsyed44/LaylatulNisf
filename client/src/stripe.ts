import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get publishable key from environment variable
// Vite requires VITE_ prefix for environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey) {
  console.warn(
    'Warning: VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe functionality will not work.'
  );
}

// Initialize Stripe
// loadStripe returns a Promise that resolves to a Stripe instance
let stripePromise: Promise<Stripe | null>;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  stripePromise = Promise.resolve(null);
}

// Export a function that returns the Stripe promise
// This ensures we only call loadStripe once and reuse the same instance
export const getStripe = (): Promise<Stripe | null> => {
  return stripePromise;
};

// Export the promise directly for convenience
export default stripePromise;

