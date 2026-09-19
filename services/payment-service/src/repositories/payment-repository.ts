import { PrismaClient, PaymentStatus } from '@prisma/client';
const prisma = new PrismaClient();
export const paymentRepository = { findByOrderId: (orderId: string) => prisma.payment.findUnique({ where: { orderId } }), create: (data: { orderId: string; userId: string; amount: number; status: PaymentStatus; failureReason?: string }) => prisma.payment.create({ data }) };
export { prisma };
