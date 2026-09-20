'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { clearCart, getCart } from '../../features/cart/api';
import { CartSnapshot } from '../../features/cart/types';
import { createOrder, Order } from '../../features/orders/api';

function CheckoutContent() {
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cartClearError, setCartClearError] = useState('');

  useEffect(() => {
    getCart().then(setSnapshot).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  const items = snapshot?.cart.items || [];
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  async function submitOrder() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    setCartClearError('');
    try {
      const createdOrder = await createOrder(items.map(({ productId, quantity }) => ({ productId, quantity })));
      setOrder(createdOrder);
      try {
        await clearCart();
      } catch {
        setCartClearError('Your order was created, but we could not clear the cart. You can clear it from the cart page.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not create your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-section text-center text-text-secondary lg:px-8">Loading checkout…</div>;
  if (order) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl text-center"><Badge tone="success">Order received</Badge><h1 className="mt-6 font-heading text-h1">Thank you for your order.</h1><p className="mt-5 text-body text-text-secondary">Your order has been created and is waiting for payment.</p><div className="mt-8 border-y border-border py-5 text-left text-small"><div className="flex justify-between"><span className="text-text-secondary">Order number</span><span className="font-mono text-primary">{order.id}</span></div><div className="mt-3 flex justify-between"><span className="text-text-secondary">Status</span><span className="font-mono text-accent">{order.status}</span></div><div className="mt-3 flex justify-between"><span className="text-text-secondary">Total</span><span className="font-mono text-primary">${Number(order.totalAmount).toFixed(2)}</span></div></div>{cartClearError && <p className="mt-5 text-left text-small text-error">{cartClearError}</p>}<Link href="/catalog"><Button className="mt-8">Continue shopping</Button></Link></Card></div>;

  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><div className="max-w-2xl"><Badge tone="accent">Review order</Badge><h1 className="mt-6 font-heading text-h1">Checkout.</h1><p className="mt-5 text-body text-text-secondary">Confirm your cart to create an order. Payment will be added in the next phase.</p></div>{error && <Card className="mt-8 border-error/30 bg-error/5"><p className="text-error">{error}</p><Link href="/cart"><Button className="mt-5" variant="secondary">Return to cart</Button></Link></Card>}{!error && items.length === 0 && <Card className="mt-10 text-center"><h2 className="font-heading text-h3">There is nothing to check out.</h2><Link href="/catalog"><Button className="mt-6">Explore the catalog</Button></Link></Card>}{!error && items.length > 0 && <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><Card><h2 className="font-heading text-h3">Items</h2><div className="mt-6 divide-y divide-border">{items.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"><div><p className="font-heading text-h4 text-text-primary">{item.name}</p><p className="mt-1 text-small text-text-secondary">Qty {item.quantity} · ${item.price.toFixed(2)} each</p></div><p className="font-mono text-small text-primary">${(item.price * item.quantity).toFixed(2)}</p></div>)}</div></Card><Card className="h-fit"><h2 className="font-heading text-h3">Summary</h2><div className="mt-6 flex justify-between border-b border-border pb-4 text-small"><span className="text-text-secondary">Total</span><span className="font-mono text-primary">${total.toFixed(2)}</span></div><p className="mt-4 text-small text-text-secondary">Payment is not collected yet. This order will remain pending payment.</p><Button className="mt-6 w-full" disabled={submitting} onClick={() => void submitOrder()}>{submitting ? 'Creating order…' : 'Confirm order'}</Button><Link href="/cart" className="mt-4 block text-center text-small text-text-secondary underline underline-offset-4">Edit cart</Link></Card></div>}</div>;
}

export default function CheckoutPage() { return <ProtectedRoute><CheckoutContent /></ProtectedRoute>; }
