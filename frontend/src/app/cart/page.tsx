'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { clearCart, getCart, removeFromCart, updateCartItem } from '../../features/cart/api';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { CartSnapshot } from '../../features/cart/types';

const formatTtl = (seconds: number) => {
  if (seconds <= 0) return 'Cart expires when empty or inactive.';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return days > 0 ? `Saved for ${days}d ${hours}h` : `Saved for ${hours || 1}h`;
};

function CartContent() {
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  async function loadCart() {
    setLoading(true);
    setError('');
    try { setSnapshot(await getCart()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load your cart.'); } finally { setLoading(false); }
  }

  useEffect(() => { void loadCart(); }, []);

  async function changeQuantity(productId: string, quantity: number) {
    setBusyId(productId);
    setError('');
    try { setSnapshot(await updateCartItem(productId, quantity)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update your cart.'); } finally { setBusyId(''); }
  }

  async function removeItem(productId: string) {
    setBusyId(productId);
    setError('');
    try { setSnapshot(await removeFromCart(productId)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to remove this item.'); } finally { setBusyId(''); }
  }

  async function emptyCart() {
    setBusyId('cart');
    setError('');
    try { await clearCart(); setSnapshot((current) => current ? { ...current, cart: { ...current.cart, items: [] }, ttlSeconds: 0 } : current); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to clear your cart.'); } finally { setBusyId(''); }
  }

  const total = useMemo(() => snapshot?.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0, [snapshot]);
  const items = snapshot?.cart.items || [];

  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><div className="max-w-2xl"><Badge tone="accent">Your selection</Badge><h1 className="mt-6 font-heading text-h1">Shopping cart.</h1><p className="mt-5 text-body text-text-secondary">Review your considered objects before moving to checkout.</p></div>{loading && <p className="py-16 text-center text-text-secondary">Loading your cart…</p>}{!loading && error && <Card className="mt-10 border-error/30 bg-error/5"><p className="text-error">{error}</p><Button className="mt-5" variant="secondary" onClick={() => void loadCart()}>Try again</Button></Card>}{!loading && !error && items.length === 0 && <Card className="mt-10 text-center"><h2 className="font-heading text-h3">Your cart is empty.</h2><p className="mt-3 text-small text-text-secondary">Find something useful for your everyday life.</p><Link href="/catalog"><Button className="mt-6">Explore the catalog</Button></Link></Card>}{!loading && !error && items.length > 0 && <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><section className="space-y-4">{items.map((item) => <Card key={item.productId} className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded bg-primary/5">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded object-cover" /> : <span className="px-2 text-center font-mono text-[10px] uppercase text-text-secondary">Meshly</span>}</div><div className="min-w-0 flex-1"><h2 className="font-heading text-h4 text-text-primary">{item.name}</h2><p className="mt-1 font-mono text-small text-primary">${item.price.toFixed(2)}</p><div className="mt-4 flex items-center gap-3"><div className="flex items-center rounded border border-border"><button type="button" className="h-9 w-9 text-primary disabled:text-text-secondary" disabled={busyId === item.productId || item.quantity <= 1} onClick={() => void changeQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span className="w-8 text-center font-mono text-small">{item.quantity}</span><button type="button" className="h-9 w-9 text-primary disabled:text-text-secondary" disabled={busyId === item.productId} onClick={() => void changeQuantity(item.productId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><button type="button" className="text-small text-text-secondary underline underline-offset-4 hover:text-error" disabled={busyId === item.productId} onClick={() => void removeItem(item.productId)}>Remove</button></div></div><p className="font-mono text-small text-primary">${(item.price * item.quantity).toFixed(2)}</p></Card>)}</section><Card className="h-fit"><h2 className="font-heading text-h3">Summary</h2><div className="mt-6 flex justify-between border-b border-border pb-4 text-small"><span className="text-text-secondary">Subtotal</span><span className="font-mono text-primary">${total.toFixed(2)}</span></div><p className="mt-4 text-small text-text-secondary">{formatTtl(snapshot?.ttlSeconds || 0)}</p><Button className="mt-6 w-full" disabled>Continue to checkout</Button><button type="button" className="mt-4 w-full text-small text-text-secondary underline underline-offset-4 hover:text-error" disabled={busyId === 'cart'} onClick={() => void emptyCart()}>Clear cart</button></Card></div>}</div>;
}

export default function CartPage() { return <ProtectedRoute><CartContent /></ProtectedRoute>; }
