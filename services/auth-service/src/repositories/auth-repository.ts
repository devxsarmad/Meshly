import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
export const authRepository = {
  findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findUserById: (id: string) => prisma.user.findUnique({ where: { id } }),
  createUser: (email: string, passwordHash: string, name?: string) => prisma.user.create({ data: { email, passwordHash, name } }),
  createRefreshToken: (userId: string, tokenHash: string, expiresAt: Date) => prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } }),
  findRefreshToken: (tokenHash: string) => prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } }),
  revokeRefreshToken: (id: string) => prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
  roleLabel: (role: Role): string => role,
};
export { prisma };
