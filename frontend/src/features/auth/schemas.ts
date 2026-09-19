import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = signInSchema.extend({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Name must be 100 characters or fewer.'),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type AuthFormValues = SignInValues & { name?: string };
