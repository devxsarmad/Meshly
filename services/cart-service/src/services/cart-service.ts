import { cartRepository } from '../repositories/cart-repository';
import { Cart, CartItem } from '../types/cart';

const emptyCart = (userId: string): Cart => ({ userId, items: [], updatedAt: new Date().toISOString() });

export const cartService = {
  async get(userId: string) { const cart = await cartRepository.get(userId); return { cart: cart ?? emptyCart(userId), ttlSeconds: cart ? await cartRepository.ttl(userId) : 0 }; },
  async addItem(userId: string, item: CartItem) { const existing = (await cartRepository.get(userId)) ?? emptyCart(userId); const index = existing.items.findIndex((cartItem) => cartItem.productId === item.productId); if (index >= 0) existing.items[index] = { ...existing.items[index], ...item, quantity: existing.items[index].quantity + item.quantity }; else existing.items.push(item); existing.updatedAt = new Date().toISOString(); return { cart: await cartRepository.save(existing), ttlSeconds: await cartRepository.ttl(userId) }; },
  async updateItem(userId: string, productId: string, quantity: number) { const cart = (await cartRepository.get(userId)) ?? emptyCart(userId); const item = cart.items.find((cartItem) => cartItem.productId === productId); if (item) item.quantity = quantity; cart.items = cart.items.filter((cartItem) => cartItem.quantity > 0); cart.updatedAt = new Date().toISOString(); return { cart: await cartRepository.save(cart), ttlSeconds: await cartRepository.ttl(userId) }; },
  async removeItem(userId: string, productId: string) { const cart = (await cartRepository.get(userId)) ?? emptyCart(userId); cart.items = cart.items.filter((item) => item.productId !== productId); cart.updatedAt = new Date().toISOString(); return { cart: await cartRepository.save(cart), ttlSeconds: await cartRepository.ttl(userId) }; },
  async clear(userId: string) { await cartRepository.remove(userId); },
};
