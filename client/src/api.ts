import type { RegistrationFormData, CheckoutResponse, Registration } from './types';

const API_BASE = '/api';

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
  };
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  registrationId?: number;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const response = await fetch(`${API_BASE}/checkout/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create PaymentIntent');
  }

  return response.json();
}

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

export interface RegistrationsResponse {
  success: boolean;
  data: Registration[];
}

export async function getAllRegistrations(): Promise<RegistrationsResponse> {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/registrations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch registrations');
  }

  return response.json();
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    username: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function verifyToken(): Promise<{ success: boolean; data: { username: string; role: string } }> {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE}/auth/verify`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem('adminToken');
    throw new Error('Token verification failed');
  }

  return response.json();
}

