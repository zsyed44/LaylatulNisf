import React, { useState } from 'react';
import type { RegistrationFormData } from '../types';

interface RegistrationCardProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading: boolean;
}

export default function RegistrationCard({ onSubmit, isLoading }: RegistrationCardProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    qty: 1,
    dietary: '',
    notes: '',
    consent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.qty < 1 || formData.qty > 10) {
      newErrors.qty = 'Ticket quantity must be between 1 and 10';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const ticketPrice = 60;
  const total = formData.qty * ticketPrice;

  return (
    <div className="bg-white rounded-lg shadow-xl border-2 border-emerald-700 p-6 md:p-8">
      <h2 className="font-serif text-3xl font-bold mb-6 text-neutral-900">
        Register Now
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.name ? 'border-red-500' : 'border-neutral-300'
            }`}
            disabled={isLoading}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.email ? 'border-red-500' : 'border-neutral-300'
            }`}
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
            Phone (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="qty" className="block text-sm font-medium text-neutral-700 mb-2">
            Number of Tickets <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="qty"
            min="1"
            max="10"
            value={formData.qty}
            onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.qty ? 'border-red-500' : 'border-neutral-300'
            }`}
            disabled={isLoading}
          />
          {errors.qty && <p className="mt-1 text-sm text-red-600">{errors.qty}</p>}
        </div>

        <div>
          <label htmlFor="dietary" className="block text-sm font-medium text-neutral-700 mb-2">
            Dietary Restrictions (Optional)
          </label>
          <textarea
            id="dietary"
            value={formData.dietary}
            onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any special requests or questions..."
            disabled={isLoading}
          />
        </div>

        <div className="bg-gradient-to-br from-gold-50 to-emerald-50 border-2 border-emerald-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-700">Tickets ({formData.qty})</span>
            <span className="font-semibold">${ticketPrice.toFixed(2)} each</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-emerald-300">
            <span className="text-lg font-semibold text-neutral-900">Total</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-gold-700 to-emerald-700 bg-clip-text text-transparent">${total.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 w-4 h-4 text-emerald-700 border-neutral-300 rounded focus:ring-emerald-500"
              disabled={isLoading}
            />
            <span className="text-sm text-neutral-700">
              I agree to the terms and conditions and understand the refund policy{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isLoading
              ? 'bg-neutral-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 active:from-emerald-900 active:to-emerald-950'
          }`}
        >
          {isLoading ? 'Processing...' : `Register & Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

