import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth-service';

const credentials = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(100).optional() });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const authController = {
  register: async (request: Request, response: Response) => { const input = credentials.parse(request.body); response.status(201).json({ success: true, message: 'Registration successful', data: await authService.register(input.email.toLowerCase(), input.password, input.name) }); },
  login: async (request: Request, response: Response) => { const input = credentials.omit({ name: true }).parse(request.body); response.json({ success: true, message: 'Login successful', data: await authService.login(input.email.toLowerCase(), input.password) }); },
  refresh: async (request: Request, response: Response) => { const input = refreshSchema.parse(request.body); response.json({ success: true, message: 'Token refreshed', data: await authService.refresh(input.refreshToken) }); },
  logout: async (request: Request, response: Response) => { const input = refreshSchema.parse(request.body); await authService.logout(input.refreshToken); response.json({ success: true, message: 'Logout successful' }); },
};
