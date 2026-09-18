import crypto from 'node:crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types/auth';

export const createAccessToken = (user: AuthUser): string => jwt.sign({ userId: user.id, role: user.role }, env.accessSecret, { expiresIn: env.accessExpiresIn as SignOptions['expiresIn'] });
export const createRefreshToken = (user: AuthUser): string => jwt.sign({ userId: user.id, tokenType: 'refresh' }, env.refreshSecret, { expiresIn: env.refreshExpiresIn as SignOptions['expiresIn'] });
export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');
export const verifyRefreshToken = (token: string): { userId: string } => { const payload = jwt.verify(token, env.refreshSecret) as jwt.JwtPayload; if (payload.tokenType !== 'refresh' || typeof payload.userId !== 'string') throw new Error('Invalid refresh token'); return { userId: payload.userId }; };
