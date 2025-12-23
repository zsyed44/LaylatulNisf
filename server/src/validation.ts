import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  qty: z.number().int().min(1, 'At least 1 ticket required').max(10, 'Maximum 10 tickets'),
  dietary: z.string().optional(),
  notes: z.string().optional(),
});

export const checkoutStartSchema = registrationSchema.extend({
  consent: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CheckoutStartInput = z.infer<typeof checkoutStartSchema>;

