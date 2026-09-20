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

export function createOrder(items: CreateOrderItem[]) {
  return apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify({ items }) });
}
