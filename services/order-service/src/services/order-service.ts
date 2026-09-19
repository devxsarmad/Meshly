import { orderRepository } from '../repositories/order-repository';
import { OrderItemInput } from '../types/order';
import { publishOrderPlaced } from '../events/order-events';
import { AppError } from '../utils/errors';

export const orderService = {
  async create(userId: string, items: OrderItemInput[]) { const totalAmount = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0); const order = await orderRepository.create(userId, items, totalAmount); await publishOrderPlaced({ eventName: 'OrderPlaced', occurredAt: new Date().toISOString(), orderId: order.id, userId: order.userId, totalAmount: Number(order.totalAmount), items: order.items.map((item) => ({ productId: item.productId, name: item.name, unitPrice: Number(item.unitPrice), quantity: item.quantity })) }); return order; },
  listForUser: (userId: string) => orderRepository.findByUser(userId),
  async getForUser(userId: string, orderId: string) { const order = await orderRepository.findById(orderId); if (!order || order.userId !== userId) throw new AppError(404, 'Order not found'); return order; },
};
