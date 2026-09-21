'use client';

import { Elements } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { MeshlyLoader } from '../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { PaymentForm } from '../../features/payments/components/payment-form';
import { stripePromise } from '../../features/payments/stripe';
import { clearCart, getCart } from '../../features/cart/api';
import { CartSnapshot } from '../../features/cart/types';
import { createOrder, createPaymentIntent, getOrder, Order } from '../../features/orders/api';
import { formatEnumLabel } from '../../lib/formatters';
import { notify } from '../../lib/toast';

function CheckoutContent() {
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [cartClearError, setCartClearError] = useState('');
  const paymentAttemptedOrderRef = useRef<string | null>(null);

  useEffect(() => {
    getCart().then(setSnapshot).catch((reason: Error) => { setError(reason.message); notify('error', reason.message); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!paymentSubmitted || !order) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const updated = await getOrder(order.id);
        if (!active) return;
        setOrder(updated);
        if (updated.status === 'CONFIRMED') { notify('success', 'Payment confirmed. Your order is confirmed.'); setPaymentSubmitted(false); return; }
        if (updated.status === 'PAYMENT_FAILED') { notify('error', 'Payment failed. Please try again with another payment method.'); setPaymentSubmitted(false); return; }
        timer = setTimeout(() => void poll(), 2000);
      } catch (reason) {
        if (active) { notify('warning', reason instanceof Error ? reason.message : 'Still waiting for payment status.'); timer = setTimeout(() => void poll(), 3000); }
      }
    };
    void poll();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [order?.id, paymentSubmitted]);

  const items = snapshot?.cart.items || [];
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  async function loadPaymentIntent(orderId: string, force = false) {
    // PaymentIntent creation is one attempt per order. A failed attempt remains
    // failed until the customer explicitly clicks “Try again”.
    const explicitRetry = force || paymentError.length > 0;
    if (!explicitRetry && paymentAttemptedOrderRef.current === orderId) return;
    paymentAttemptedOrderRef.current = orderId;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const payment = await createPaymentIntent(orderId);
      setClientSecret(payment.clientSecret);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to prepare Stripe payment.';
      setPaymentError(message);
      notify('error', message);
    } finally {
      setPaymentLoading(false);
    }
  }

  async function submitOrder() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    setCartClearError('');
    try {
      const createdOrder = await createOrder(items.map(({ productId, quantity }) => ({ productId, quantity })));
      setOrder(createdOrder);
      notify('success', 'Order created successfully.');
      try { await clearCart(); } catch { const message = 'Your order was created, but we could not clear the cart.'; setCartClearError(`${message} You can clear it from the cart page.`); notify('warning', message); }
      await loadPaymentIntent(createdOrder.id);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'We could not create your order. Please try again.';
      setError(message);
      notify('error', message);
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading checkout…" /></div>;
  if (error && !order) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="border-error/30 bg-error/5"><p className="text-error">{error}</p><Link href="/cart"><Button className="mt-5" variant="secondary">Return to cart</Button></Link></Card></div>;
  if (order) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl"><div className="text-center"><Badge tone={order.status === 'CONFIRMED' ? 'success' : order.status === 'PAYMENT_FAILED' ? 'error' : 'accent'}>{order.status === 'CONFIRMED' ? 'Payment confirmed' : order.status === 'PAYMENT_FAILED' ? 'Payment failed' : 'Payment required'}</Badge><h1 className="mt-6 font-heading text-h1">Complete your payment.</h1><p className="mt-5 text-body text-text-secondary">Order {order.id} is currently {formatEnumLabel(order.status)}.</p></div><div className="mt-8 border-y border-border py-5 text-small"><div className="flex justify-between"><span className="text-text-secondary">Order total</span><span className="font-mono text-primary">${Number(order.totalAmount).toFixed(2)}</span></div><div className="mt-3 flex justify-between"><span className="text-text-secondary">Status</span><span className="font-mono text-accent">{formatEnumLabel(order.status)}</span></div></div>{cartClearError && <p className="mt-5 text-small text-error">{cartClearError}</p>}{paymentSubmitted ? <MeshlyLoader label="Waiting for Stripe confirmation…" /> : order.status === 'PENDING_PAYMENT' && (paymentLoading ? <MeshlyLoader label="Preparing secure payment…" /> : paymentError ? <div className="mt-6"><p className="text-small text-error">{paymentError}</p><Button className="mt-5" variant="secondary" onClick={() => void loadPaymentIntent(order.id)}>Try again</Button></div> : stripePromise && clientSecret ? <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#193b37', colorBackground: '#f7f2ec', colorText: '#193b37', borderRadius: '4px' } } }}><PaymentForm onSubmitted={() => setPaymentSubmitted(true)} /></Elements> : <p className="mt-6 text-small text-error">Stripe publishable key is not configured.</p>)}{order.status === 'CONFIRMED' && <p className="mt-8 text-center text-small text-success">Your payment was confirmed successfully.</p>}{order.status === 'PAYMENT_FAILED' && <p className="mt-8 text-center text-small text-error">Your payment was declined. Please try again with another card.</p>}<Link href="/catalog" className="mt-8 block text-center"><Button variant="secondary">Continue shopping</Button></Link></Card></div>;

  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><div className="max-w-2xl"><Badge tone="accent">Review order</Badge><h1 className="mt-6 font-heading text-h1">Checkout.</h1><p className="mt-5 text-body text-text-secondary">Confirm your cart to create an order and continue to secure payment.</p></div>{!error && items.length === 0 && <Card className="mt-10 text-center"><h2 className="font-heading text-h3">There is nothing to check out.</h2><Link href="/catalog"><Button className="mt-6">Explore the catalog</Button></Link></Card>}{!error && items.length > 0 && <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><Card><h2 className="font-heading text-h3">Items</h2><div className="mt-6 divide-y divide-border">{items.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"><div><p className="font-heading text-h4 text-text-primary">{item.name}</p><p className="mt-1 text-small text-text-secondary">Qty {item.quantity} · ${item.price.toFixed(2)} each</p></div><p className="font-mono text-small text-primary">${(item.price * item.quantity).toFixed(2)}</p></div>)}</div></Card><Card className="h-fit"><h2 className="font-heading text-h3">Summary</h2><div className="mt-6 flex justify-between border-b border-border pb-4 text-small"><span className="text-text-secondary">Total</span><span className="font-mono text-primary">${total.toFixed(2)}</span></div><Button className="mt-6 w-full" disabled={submitting} onClick={() => void submitOrder()}>{submitting ? 'Creating order…' : 'Continue to payment'}</Button><Link href="/cart" className="mt-4 block text-center text-small text-text-secondary underline underline-offset-4">Edit cart</Link></Card></div>}</div>;
}

export default function CheckoutPage() { return <ProtectedRoute><CheckoutContent /></ProtectedRoute>; }
