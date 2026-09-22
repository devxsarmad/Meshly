'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { MeshlyLoader } from '../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { listOrders, type Order, type OrdersPage as OrdersPageData } from '../../features/orders/api';
import { formatEnumLabel } from '../../lib/formatters';
import { notify } from '../../lib/toast';

function statusTone(status: string): 'accent' | 'success' | 'error' | 'neutral' {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PAYMENT_FAILED') return 'error';
  if (status === 'PENDING_PAYMENT') return 'accent';
  return 'neutral';
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-small text-text-secondary">Order {order.id}</p>
          <p className="mt-2 text-small text-text-secondary">
            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Badge tone={statusTone(order.status)}>{formatEnumLabel(order.status)}</Badge>
      </div>
      <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1 text-small">
          {order.items.slice(0, 2).map((item) => <p key={item.productId} className="text-text-secondary">{item.name} <span className="text-text-primary">× {item.quantity}</span></p>)}
          {order.items.length > 2 && <p className="text-text-secondary">+ {order.items.length - 2} more</p>}
        </div>
        <p className="font-mono text-primary">${Number(order.totalAmount).toFixed(2)}</p>
      </div>
    </Card>
  );
}

function OrdersContent() {
  const [result, setResult] = useState<OrdersPageData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listOrders(page).then((value) => { if (active) setResult(value); }).catch((reason: Error) => {
      if (active) { setError(reason.message); notify('error', reason.message); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  if (loading && !result) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading your orders…" /></div>;
  if (error && !result) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="border-error/30 bg-error/5"><p className="text-error">{error}</p><Button className="mt-5" variant="secondary" onClick={() => setPage(1)}>Try again</Button></Card></div>;

  const orders = result?.items ?? [];
  const pagination = result?.pagination;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <div className="max-w-2xl"><Badge tone="accent">Your account</Badge><h1 className="mt-6 font-heading text-h1">Order history.</h1><p className="mt-5 text-body text-text-secondary">A clear record of what you bought, when it arrived, and how each payment settled.</p></div>
    {loading && <div className="mt-8"><MeshlyLoader label="Updating orders…" /></div>}
    {!loading && orders.length === 0 && <Card className="mt-10 text-center"><h2 className="font-heading text-h3">No orders yet.</h2><p className="mt-3 text-text-secondary">Your completed purchases will appear here.</p><Link href="/catalog"><Button className="mt-6">Explore the catalog</Button></Link></Card>}
    {orders.length > 0 && <div className="mt-10 space-y-4">{orders.map((order) => <OrderRow key={order.id} order={order} />)}</div>}
    {pagination && pagination.totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-8"><Button size="sm" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="min-w-28 text-center text-small text-text-secondary">Page {pagination.page} of {pagination.totalPages}</span><Button size="sm" variant="secondary" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
  </div>;
}

export default function OrdersPage() { return <ProtectedRoute><OrdersContent /></ProtectedRoute>; }
