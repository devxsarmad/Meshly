import { OrderItemInput } from '../types/order';

export type ClientOrderItem = { productId: string; quantity: number };
export type VerifiedProduct = { name: string; price: number };

export async function enrichOrderItems(items: ClientOrderItem[], fetchProduct: (productId: string) => Promise<VerifiedProduct>): Promise<OrderItemInput[]> {
  return Promise.all(items.map(async (item) => {
    const product = await fetchProduct(item.productId);
    return { productId: item.productId, name: product.name, unitPrice: product.price, quantity: item.quantity };
  }));
}

export function calculateOrderTotal(items: OrderItemInput[], membership?: { status: string } | null) {
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const clubDiscount = membership?.status === 'ACTIVE' ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  return { subtotal, clubDiscount, totalAmount: Math.max(0, subtotal - clubDiscount) };
}
