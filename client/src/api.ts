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
    let errorMessage = 'Failed to create PaymentIntent';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || `HTTP ${response.status}: Failed to create PaymentIntent`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
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
    let errorMessage = 'Failed to start checkout';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}: Failed to start checkout`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
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
    let errorMessage = 'Failed to confirm checkout';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}: Failed to confirm checkout`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    const result = JSON.parse(text);
    return result.data;
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
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
    let errorMessage = 'Failed to fetch registrations';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}: Failed to fetch registrations`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
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
    let errorMessage = 'Login failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}: Login failed`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
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
    let errorMessage = 'Token verification failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}: Token verification failed`;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
}

