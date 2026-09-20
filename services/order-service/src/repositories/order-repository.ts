import { OrderStatus, PrismaClient } from '@prisma/client';
import { OrderItemInput } from '../types/order';
const prisma = new PrismaClient();
export const orderRepository = {
  create: (userId: string, items: OrderItemInput[], totalAmount: number) => prisma.order.create({ data: { userId, totalAmount, items: { create: items } }, include: { items: true } }),
  findByUser: async (userId: string, page: number, limit: number) => {
    const where = { userId };
    const [items, total] = await Promise.all([
      prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.order.count({ where }),
    ]);
    return { items, total };
  },
  findById: (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),
  updatePaymentStatus: (id: string, status: OrderStatus) => prisma.order.updateMany({ where: { id, status: OrderStatus.PENDING_PAYMENT }, data: { status } }),
};
export { prisma };
