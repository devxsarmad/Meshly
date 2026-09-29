import { apiFetch } from '../../lib/api-client';

export type WishlistItem = { productId: string; name: string; price: number; imageUrl?: string; addedAt: string };

export const getWishlist = () => apiFetch<WishlistItem[]>('/api/cart/wishlist');
export const addToWishlist = (item: Omit<WishlistItem, 'addedAt'>) => apiFetch<WishlistItem[]>('/api/cart/wishlist', { method: 'POST', body: JSON.stringify(item) });
export const removeFromWishlist = (productId: string) => apiFetch<WishlistItem[]>(`/api/cart/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });
