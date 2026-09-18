import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request { user?: { userId: string; role: string } }

export const verifyAccessToken = (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ success: false, message: 'Authentication required', error: 'Missing access token' }); return; }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') throw new Error('Invalid token claims');
    request.user = { userId: payload.userId, role: payload.role };
    next();
  } catch { response.status(401).json({ success: false, message: 'Invalid or expired access token', error: 'Unauthorized' }); }
};
