import { PaymentStatus, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const paymentRepository = {
  findByOrderId: (orderId: string) => prisma.payment.findUnique({ where: { orderId } }),
  findByPaymentIntentId: (paymentIntentId: string) => prisma.payment.findUnique({ where: { paymentIntentId } }),
  findByStripeEventId: (stripeEventId: string) => prisma.payment.findUnique({ where: { stripeEventId } }),
  create: (data: { orderId: string; userId: string; amount: number; status: PaymentStatus; paymentIntentId: string }) => prisma.payment.create({ data }),
  updateFromStripe: (id: string, status: PaymentStatus, stripeEventId: string, failureReason?: string) => prisma.payment.updateMany({ where: { id, status: PaymentStatus.PENDING, stripeEventId: null }, data: { status, stripeEventId, failureReason } }),
};
export { prisma };
