export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  qty: number;
  dietary: string;
  notes: string;
  consent: boolean;
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  qty: number;
  dietary: string | null;
  notes: string | null;
  status: 'pending' | 'paid';
  checkedIn: boolean;
  createdAt: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    registrationId: number;
    checkoutUrl: string | null;
    clientSecret: string | null;
    message: string;
  };
}

