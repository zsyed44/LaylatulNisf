// Stripe initialization and helpers
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
let cachedSecretKey: string | null = null;

function validateStripeKey(key: string, keyName: string): void {
  if (!key) {
    throw new Error(`${keyName} environment variable is required`);
  }
  
  // Check if key is in test mode
  const isTestMode = key.startsWith('sk_test_') || key.startsWith('pk_test_');
  const isLiveMode = key.startsWith('sk_live_') || key.startsWith('pk_live_');
  
  if (!isTestMode && !isLiveMode) {
    throw new Error(`${keyName} appears to be invalid. Stripe keys should start with sk_test_, sk_live_, pk_test_, or pk_live_`);
  }
  
  // Log mode for debugging (but don't expose full key)
  const mode = isTestMode ? 'TEST' : 'LIVE';
  console.log(`[Stripe] Using ${mode} mode for ${keyName}`);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  // If key changed, clear the cached instance
  if (stripeInstance && cachedSecretKey !== secretKey) {
    console.log('[Stripe] Key changed, clearing cached instance');
    stripeInstance = null;
    cachedSecretKey = null;
  }
  
  if (!stripeInstance) {
    validateStripeKey(secretKey || '', 'STRIPE_SECRET_KEY');
    
    // Remove apiVersion to use default (avoids type mismatch)
    stripeInstance = new Stripe(secretKey!);
    cachedSecretKey = secretKey!;
  }
  return stripeInstance;
}

// Export function to clear cache (useful for testing or key changes)
export function clearStripeCache(): void {
  stripeInstance = null;
  cachedSecretKey = null;
}

