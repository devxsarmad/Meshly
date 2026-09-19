export interface BaseEvent { eventName: string; occurredAt: string; orderId: string; userId: string; }
export interface OrderPlacedEvent extends BaseEvent { eventName: 'OrderPlaced'; totalAmount: number; }
export interface PaymentConfirmedEvent extends BaseEvent { eventName: 'PaymentConfirmed'; paymentId: string; amount: number; }
export interface PaymentFailedEvent extends BaseEvent { eventName: 'PaymentFailed'; paymentId: string; amount: number; failureReason: string; }
export type NotificationEvent = OrderPlacedEvent | PaymentConfirmedEvent | PaymentFailedEvent;
