import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request { userId?: string; }

export const requireAuth = (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ success: false, message: 'Authentication required', error: 'Missing access token' }); return; }
  try { const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload; if (typeof payload.userId !== 'string') throw new Error('Invalid token claims'); request.userId = payload.userId; next(); } catch { response.status(401).json({ success: false, message: 'Invalid or expired access token', error: 'Unauthorized' }); }
};
