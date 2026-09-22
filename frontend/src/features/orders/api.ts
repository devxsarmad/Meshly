import { apiFetch } from '../../lib/api-client';

export type CreateOrderItem = { productId: string; quantity: number };
export type Order = {
  id: string;
  userId: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
  items: Array<{ productId: string; name: string; unitPrice: number | string; quantity: number }>;
};

export type OrdersPage = {
  items: Order[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export function createOrder(items: CreateOrderItem[]) {
  return apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify({ items }) });
}

export function getOrder(orderId: string) {
  return apiFetch<Order>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export function listOrders(page = 1, limit = 8) {
  return apiFetch<OrdersPage>(`/api/orders?page=${page}&limit=${limit}`);
}

export function createPaymentIntent(orderId: string) {
  return apiFetch<{ clientSecret: string; paymentIntentId: string; status: string }>('/api/payments/create-intent', { method: 'POST', body: JSON.stringify({ orderId }) });
}
