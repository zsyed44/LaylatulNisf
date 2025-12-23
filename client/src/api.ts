import type { RegistrationFormData, CheckoutResponse, Registration } from './types';

const API_BASE = '/api';

export async function startCheckout(data: RegistrationFormData): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/checkout/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start checkout');
  }

  return response.json();
}

export async function confirmCheckout(registrationId: number): Promise<Registration> {
  const response = await fetch(`${API_BASE}/checkout/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ registrationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to confirm checkout');
  }

  const result = await response.json();
  return result.data;
}

