import { apiFetch } from '../../lib/api-client';
import { CartItem, CartSnapshot } from './types';

const cartRequest = <T>(path: string, init: RequestInit = {}) => apiFetch<T>(`/api/cart${path}`, init);

export function getCart() { return cartRequest<CartSnapshot>(''); }
export function addToCart(item: CartItem) { return cartRequest<CartSnapshot>('/items', { method: 'POST', body: JSON.stringify(item) }); }
export function updateCartItem(productId: string, quantity: number) { return cartRequest<CartSnapshot>(`/items/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }); }
export function removeFromCart(productId: string) { return cartRequest<CartSnapshot>(`/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }); }
export function clearCart() { return cartRequest<undefined>('', { method: 'DELETE' }); }
