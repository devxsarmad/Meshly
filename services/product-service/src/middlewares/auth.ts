import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const requireAdmin = (request: Request, response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ success: false, message: 'Authentication required', error: 'Missing access token' }); return; }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    if (payload.role !== 'ADMIN') throw new Error('Admin role required');
    next();
  } catch { response.status(403).json({ success: false, message: 'Admin access required', error: 'Forbidden' }); }
};
