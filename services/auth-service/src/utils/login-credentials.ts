import { z } from 'zod';

export const loginCredentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const normalizeLoginEmail = (email: string): string => email.trim().toLowerCase();
