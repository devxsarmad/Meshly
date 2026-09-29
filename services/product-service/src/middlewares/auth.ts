import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request { userId?: string; userName?: string; }

export const requireAuth = (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
  const cookieToken = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('meshly_access_token='))?.slice('meshly_access_token='.length);
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '') || cookieToken;
  if (!token) { response.status(401).json({ success: false, message: 'Authentication required', error: 'Missing access token' }); return; }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    if (typeof payload.userId !== 'string') throw new Error('Invalid token claims');
    request.userId = payload.userId;
    request.userName = typeof payload.name === 'string' ? payload.name : 'Meshly customer';
    next();
  } catch { response.status(401).json({ success: false, message: 'Invalid or expired access token', error: 'Unauthorized' }); }
};

export const requireAdmin = (request: Request, response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ success: false, message: 'Authentication required', error: 'Missing access token' }); return; }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    if (payload.role !== 'ADMIN') throw new Error('Admin role required');
    next();
  } catch { response.status(403).json({ success: false, message: 'Admin access required', error: 'Forbidden' }); }
};
