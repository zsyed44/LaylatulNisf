export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  qty: number;
  dietary: string | null;
  notes: string | null;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface RegistrationInput {
  name: string;
  email: string;
  phone?: string;
  qty: number;
  dietary?: string;
  notes?: string;
}

export interface StorageAdapter {
  createRegistration(data: RegistrationInput): Promise<Registration>;
  getRegistration(id: number): Promise<Registration | null>;
  getAllRegistrations(): Promise<Registration[]>;
  updateRegistrationStatus(id: number, status: 'pending' | 'paid'): Promise<void>;
}

