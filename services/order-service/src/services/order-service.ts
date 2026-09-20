import { OrderStatus } from '@prisma/client';
import { orderRepository } from '../repositories/order-repository';
import { OrderItemInput } from '../types/order';
import { publishOrderPlaced } from '../events/order-events';
import { AppError } from '../utils/errors';

export const orderService = {
  async create(userId: string, items: OrderItemInput[]) { const totalAmount = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0); const order = await orderRepository.create(userId, items, totalAmount); await publishOrderPlaced({ eventName: 'OrderPlaced', occurredAt: new Date().toISOString(), orderId: order.id, userId: order.userId, totalAmount: Number(order.totalAmount), items: order.items.map((item) => ({ productId: item.productId, name: item.name, unitPrice: Number(item.unitPrice), quantity: item.quantity })) }); return order; },
  listForUser: (userId: string, page: number, limit: number) => orderRepository.findByUser(userId, page, limit),
  async getForUser(userId: string, orderId: string) { const order = await orderRepository.findById(orderId); if (!order || order.userId !== userId) throw new AppError(404, 'Order not found'); return order; },
  async handlePaymentEvent(event: { eventName: 'PaymentConfirmed' | 'PaymentFailed'; orderId: string }): Promise<void> {
    const order = await orderRepository.findById(event.orderId);
    if (!order) { console.warn(`[order-service] Ignoring ${event.eventName}: order ${event.orderId} was not found`); return; }
    if (order.status !== OrderStatus.PENDING_PAYMENT) { console.warn(`[order-service] Ignoring duplicate ${event.eventName}: order ${event.orderId} is already ${order.status}`); return; }
    const status = event.eventName === 'PaymentConfirmed' ? OrderStatus.CONFIRMED : OrderStatus.PAYMENT_FAILED;
    const result = await orderRepository.updatePaymentStatus(event.orderId, status);
    if (result.count === 0) { console.warn(`[order-service] Skipping ${event.eventName}: order ${event.orderId} changed before payment update`); return; }
    console.log(`[order-service] Payment event processed: order ${event.orderId} -> ${status}`);
  },
};
