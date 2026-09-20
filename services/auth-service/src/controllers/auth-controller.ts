import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth-service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const credentials = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(100).optional() });
const refreshSchema = z.object({ refreshToken: z.string().min(1).optional() });
const ACCESS_COOKIE = 'meshly_access_token';
const REFRESH_COOKIE = 'meshly_refresh_token';
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: env.cookieSecure, path: '/' };
const readCookie = (request: Request, name: string) => request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
const setSessionCookies = (response: Response, tokens: { accessToken: string; refreshToken: string }) => { response.cookie(ACCESS_COOKIE, tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); response.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); };
const clearSessionCookies = (response: Response) => { response.clearCookie(ACCESS_COOKIE, cookieOptions); response.clearCookie(REFRESH_COOKIE, cookieOptions); };
const sessionFromRequest = (request: Request) => { const token = readCookie(request, ACCESS_COOKIE) || request.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) throw new AppError(401, 'Authentication required'); try { const payload = jwt.verify(token, env.accessSecret) as jwt.JwtPayload; if (typeof payload.userId !== 'string') throw new Error('Invalid claims'); return payload.userId; } catch { throw new AppError(401, 'Invalid or expired access token'); } };
export const authController = {
  register: async (request: Request, response: Response) => { const input = credentials.parse(request.body); const session = await authService.register(input.email.toLowerCase(), input.password, input.name); setSessionCookies(response, session.tokens); response.status(201).json({ success: true, message: 'Registration successful', data: { user: session.user } }); },
  login: async (request: Request, response: Response) => { const input = credentials.omit({ name: true }).parse(request.body); const session = await authService.login(input.email.toLowerCase(), input.password); setSessionCookies(response, session.tokens); response.json({ success: true, message: 'Login successful', data: { user: session.user } }); },
  me: async (request: Request, response: Response) => response.json({ success: true, message: 'Session retrieved', data: { user: await authService.getUserById(sessionFromRequest(request)) } }),
  refresh: async (request: Request, response: Response) => { const input = refreshSchema.parse(request.body); const refreshToken = readCookie(request, REFRESH_COOKIE) || input.refreshToken; if (!refreshToken) throw new AppError(401, 'Refresh token required'); const session = await authService.refresh(refreshToken); setSessionCookies(response, session.tokens); response.json({ success: true, message: 'Token refreshed', data: { user: session.user } }); },
  logout: async (request: Request, response: Response) => { const input = refreshSchema.parse(request.body); const refreshToken = readCookie(request, REFRESH_COOKIE) || input.refreshToken; if (refreshToken) await authService.logout(refreshToken); clearSessionCookies(response); response.json({ success: true, message: 'Logout successful' }); },
};
