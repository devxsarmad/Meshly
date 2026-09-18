import bcrypt from 'bcryptjs';
import { authRepository } from '../repositories/auth-repository';
import { AuthUser, TokenPair } from '../types/auth';
import { AppError } from '../utils/errors';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens';

const publicUser = (user: { id: string; email: string; name: string | null; role: string }): AuthUser => ({ id: user.id, email: user.email, name: user.name, role: user.role });
const pairFor = async (user: AuthUser): Promise<TokenPair> => { const refreshToken = createRefreshToken(user); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); await authRepository.createRefreshToken(user.id, hashToken(refreshToken), expiresAt); return { accessToken: createAccessToken(user), refreshToken }; };

export const authService = {
  async register(email: string, password: string, name?: string) { if (await authRepository.findUserByEmail(email)) throw new AppError(409, 'Email is already registered'); const user = await authRepository.createUser(email, await bcrypt.hash(password, 12), name); return { user: publicUser(user), tokens: await pairFor(publicUser(user)) }; },
  async login(email: string, password: string) { const user = await authRepository.findUserByEmail(email); if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'Invalid email or password'); return { user: publicUser(user), tokens: await pairFor(publicUser(user)) }; },
  async refresh(refreshToken: string) { try { const { userId } = verifyRefreshToken(refreshToken); const stored = await authRepository.findRefreshToken(hashToken(refreshToken)); if (!stored || stored.userId !== userId || stored.revokedAt || stored.expiresAt < new Date()) throw new Error('Token is not active'); await authRepository.revokeRefreshToken(stored.id); const user = publicUser(stored.user); return { user, tokens: await pairFor(user) }; } catch { throw new AppError(401, 'Invalid or expired refresh token'); } },
  async logout(refreshToken: string) { const stored = await authRepository.findRefreshToken(hashToken(refreshToken)); if (stored && !stored.revokedAt) await authRepository.revokeRefreshToken(stored.id); },
};
