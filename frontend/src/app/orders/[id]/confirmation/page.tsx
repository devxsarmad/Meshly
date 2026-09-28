'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { MeshlyLoader } from '../../../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../../../features/auth/components/protected-route';
import { getOrder, type Order } from '../../../../features/orders/api';
import { formatEnumLabel } from '../../../../lib/formatters';
import { notify } from '../../../../lib/toast';

function ConfirmationContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrder(params.id)
      .then(setOrder)
      .catch((reason: Error) => { setError(reason.message); notify('error', reason.message); })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading your confirmation…" /></div>;
  if (error || !order) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl border-error/30 bg-error/5"><p className="text-error">{error || 'Order not found.'}</p><Link href="/orders"><Button className="mt-5" variant="secondary">View order history</Button></Link></Card></div>;
  const confirmed = order.status === 'CONFIRMED';
  const failed = order.status === 'PAYMENT_FAILED';

  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <Card className="mx-auto max-w-2xl text-center">
      <Badge tone={confirmed ? 'success' : failed ? 'error' : 'accent'}>{formatEnumLabel(order.status)}</Badge>
      <h1 className="mt-6 font-heading text-h1">{confirmed ? 'Thank you for your order.' : failed ? 'Payment needs attention.' : 'Your order is being prepared.'}</h1>
      <p className="mt-5 text-body text-text-secondary">{confirmed ? 'Your order has been received and your payment has been confirmed.' : failed ? 'Your order was created, but the payment did not complete.' : 'Your order was created and is waiting for payment confirmation.'}</p>
      <div className="mt-8 border-y border-border py-5 text-small">
        <div className="flex justify-between gap-4"><span className="text-text-secondary">Order number</span><span className="font-mono text-primary">{order.id}</span></div>
        {Number(order.discountAmount) > 0 && <div className="mt-3 flex justify-between"><span className="text-text-secondary">Meshly Club discount</span><span className="font-mono text-success">-${Number(order.discountAmount).toFixed(2)}</span></div>}
        <div className="mt-3 flex justify-between"><span className="text-text-secondary">Total</span><span className="font-mono text-primary">${Number(order.totalAmount).toFixed(2)}</span></div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href={`/orders/${order.id}`}><Button>{failed ? 'Try payment again' : 'View order details'}</Button></Link><Link href="/catalog"><Button variant="secondary">Continue shopping</Button></Link></div>
    </Card>
  </div>;
}

export default function OrderConfirmationPage() { return <ProtectedRoute><ConfirmationContent /></ProtectedRoute>; }
