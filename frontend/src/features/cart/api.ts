import { apiUrl, getAccessToken } from '../../lib/api';
import { CartItem, CartSnapshot } from './types';

async function cartRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Please sign in before using your cart.');
  const response = await fetch(`${apiUrl}/api/cart${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, ...init.headers },
  });
  const payload = await response.json() as { success: boolean; message?: string; data?: T };
  if (!response.ok) throw new Error(payload.message || 'Unable to update your cart.');
  return payload.data as T;
}

export function getCart() { return cartRequest<CartSnapshot>(''); }
export function addToCart(item: CartItem) { return cartRequest<CartSnapshot>('/items', { method: 'POST', body: JSON.stringify(item) }); }
export function updateCartItem(productId: string, quantity: number) { return cartRequest<CartSnapshot>(`/items/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }); }
export function removeFromCart(productId: string) { return cartRequest<CartSnapshot>(`/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }); }
export function clearCart() { return cartRequest<undefined>('', { method: 'DELETE' }); }
