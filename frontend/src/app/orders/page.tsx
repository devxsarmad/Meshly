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
  const shortId = order.id.split('-')[0];

  const statusStyles: Record<string, string> = {
    CONFIRMED: 'bg-success/10 text-success',
    PAYMENT_FAILED: 'bg-error/10 text-error',
    PENDING_PAYMENT: 'bg-accent/10 text-accent',
  };
  const pillClass = statusStyles[order.status] ?? 'bg-border/40 text-text-secondary';

  return (
    <Card className="p-5 transition-colors hover:border-accent sm:p-6">
      <Link
        href={`/orders/${order.id}`}
        className="block rounded focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-small text-text-primary">#{shortId}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${pillClass}`}>
                {formatEnumLabel(order.status)}
              </span>
            </div>
            <p className="mt-1.5 text-small text-text-secondary">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' · '}
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <p className="shrink-0 font-mono text-h4 text-primary">
            ${Number(order.totalAmount).toFixed(2)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-small text-text-secondary">
          {order.items.slice(0, 3).map((item) => (
            <span key={item.productId}>
              {item.name} <span className="text-text-primary">×{item.quantity}</span>
            </span>
          ))}
          {order.items.length > 3 && (
            <span>+{order.items.length - 3} more</span>
          )}
        </div>
      </Link>
    </Card>
  );
}

function OrdersContent() {
  const [result, setResult] = useState<OrdersPageData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listOrders(page).then((value) => { if (active) setResult(value); }).catch((reason: Error) => {
      if (active) { setError(reason.message); notify('error', reason.message); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, reload]);

  if (loading && !result) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading your orders…" /></div>;
  if (error && !result) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="border-error/30 bg-error/5"><p className="text-error">{error}</p><Button className="mt-5" variant="secondary" onClick={() => setReload((current) => current + 1)}>Try again</Button></Card></div>;

  const orders = result?.items ?? [];
  const pagination = result?.pagination;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <div className="max-w-2xl"><Badge tone="accent">Your account</Badge><h1 className="mt-6 font-heading text-h1">Order history.</h1><p className="mt-5 text-body text-text-secondary">A clear record of what you bought, when it arrived, and how each payment settled.</p></div>
    {loading && <div className="mt-8"><MeshlyLoader label="Updating orders…" /></div>}
    {error && result && <div className="mt-8 flex flex-col gap-3 rounded border border-error/30 bg-error/5 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-small text-error">{error}</p><Button size="sm" variant="secondary" onClick={() => setReload((current) => current + 1)}>Try again</Button></div>}
    {!loading && orders.length === 0 && <Card className="mt-10 text-center"><h2 className="font-heading text-h3">No orders yet.</h2><p className="mt-3 text-text-secondary">Your completed purchases will appear here.</p><Link href="/catalog"><Button className="mt-6">Explore the catalog</Button></Link></Card>}
    {orders.length > 0 && <div className="mt-10 space-y-4">{orders.map((order) => <OrderRow key={order.id} order={order} />)}</div>}
    {pagination && pagination.totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-8"><Button size="sm" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="min-w-28 text-center text-small text-text-secondary">Page {pagination.page} of {pagination.totalPages}</span><Button size="sm" variant="secondary" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
  </div>;
}

export default function OrdersPage() { return <ProtectedRoute><OrdersContent /></ProtectedRoute>; }
