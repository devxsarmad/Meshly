import crypto from 'node:crypto';
import { NotificationEvent, OrderPlacedEvent, PaymentConfirmedEvent, PaymentFailedEvent } from '../types/events';
import { NotificationLog } from '../types/notification';

const logs: NotificationLog[] = [];
const recipientFor = (userId: string): string => `customer-${userId}@meshly.test`;
const addLog = (event: NotificationEvent, channel: 'email' | 'sms', message: string): void => { const log = { id: crypto.randomUUID(), eventName: event.eventName, userId: event.userId, orderId: event.orderId, channel, recipient: channel === 'email' ? recipientFor(event.userId) : `+1555${event.userId.replace(/\D/g, '').slice(-7).padStart(7, '0')}`, message, createdAt: new Date().toISOString() }; logs.push(log); console.log(`[mock-${channel}] ${log.recipient}: ${log.message}`); };

export const notificationService = {
  async handle(event: NotificationEvent): Promise<void> { if (event.eventName === 'OrderPlaced') { const placed = event as OrderPlacedEvent; addLog(placed, 'email', `Your Meshly order ${placed.orderId} was received.`); return; } if (event.eventName === 'PaymentConfirmed') { const confirmed = event as PaymentConfirmedEvent; addLog(confirmed, 'email', `Payment confirmed for order ${confirmed.orderId}.`); addLog(confirmed, 'sms', `Meshly payment confirmed for order ${confirmed.orderId}.`); return; } const failed = event as PaymentFailedEvent; addLog(failed, 'email', `Payment failed for order ${failed.orderId}: ${failed.failureReason}.`); },
  list: (): NotificationLog[] => [...logs],
};
