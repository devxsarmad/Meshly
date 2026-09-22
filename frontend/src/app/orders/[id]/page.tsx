'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { MeshlyLoader } from '../../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../../features/auth/components/protected-route';
import { getOrder, type Order } from '../../../features/orders/api';
import { formatEnumLabel } from '../../../lib/formatters';
import { notify } from '../../../lib/toast';

function statusTone(status: string): 'accent' | 'success' | 'error' | 'neutral' {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PAYMENT_FAILED') return 'error';
  if (status === 'PENDING_PAYMENT') return 'accent';
  return 'neutral';
}

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { getOrder(params.id).then(setOrder).catch((reason: Error) => { setError(reason.message); notify('error', reason.message); }).finally(() => setLoading(false)); }, [params.id]);
  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading order details…" /></div>;
  if (error || !order) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="border-error/30 bg-error/5"><p className="text-error">{error || 'Order not found.'}</p><Link href="/orders"><Button className="mt-5" variant="secondary">Back to orders</Button></Link></Card></div>;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Link href="/orders" className="text-small text-text-secondary underline underline-offset-4">← Back to order history</Link><div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Badge tone={statusTone(order.status)}>{formatEnumLabel(order.status)}</Badge><h1 className="mt-5 font-heading text-h1">Order details.</h1><p className="mt-3 font-mono text-small text-text-secondary">{order.id}</p></div><p className="text-small text-text-secondary">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]"><Card><h2 className="font-heading text-h3">Items</h2><div className="mt-6 divide-y divide-border">{order.items.map((item) => <div key={item.productId} className="flex justify-between gap-5 py-5 first:pt-0 last:pb-0"><div><p className="font-heading text-h4">{item.name}</p><p className="mt-1 text-small text-text-secondary">Quantity {item.quantity} · ${Number(item.unitPrice).toFixed(2)} each</p></div><p className="font-mono text-small text-primary">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</p></div>)}</div></Card><Card className="h-fit"><h2 className="font-heading text-h3">Summary</h2><div className="mt-6 flex justify-between border-b border-border pb-4 text-small"><span className="text-text-secondary">Status</span><span className="font-mono text-accent">{formatEnumLabel(order.status)}</span></div><div className="mt-4 flex justify-between text-small"><span className="text-text-secondary">Total</span><span className="font-mono text-primary">${Number(order.totalAmount).toFixed(2)}</span></div>{order.status === 'PENDING_PAYMENT' && <Link href={`/checkout?orderId=${encodeURIComponent(order.id)}`}><Button className="mt-6 w-full">Pay now</Button></Link>}{order.status === 'PAYMENT_FAILED' && <Link href={`/checkout?orderId=${encodeURIComponent(order.id)}`}><Button className="mt-6 w-full" variant="secondary">Try payment again</Button></Link>}<Link href="/catalog" className="mt-4 block text-center text-small text-text-secondary underline underline-offset-4">Continue shopping</Link></Card></div></div>;
}

export default function OrderDetailsPage() { return <ProtectedRoute><OrderDetailsContent /></ProtectedRoute>; }
