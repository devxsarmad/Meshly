'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { useAuth } from '../../features/auth/auth-context';
import { createBillingPortal, getMembership, type Membership } from '../../features/subscriptions/api';
import { listOrders, type Order } from '../../features/orders/api';
import { formatEnumLabel } from '../../lib/formatters';
import { notify } from '../../lib/toast';

function MembershipPanel() {
  const [membership, setMembership] = useState<Membership>(null);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [error, setError] = useState('');
  const loadMembership = () => { setLoading(true); setError(''); getMembership().then(setMembership).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); };
  useEffect(() => { loadMembership(); }, []);
  async function openPortal() { setOpeningPortal(true); try { const portal = await createBillingPortal(); window.location.assign(portal.url); } catch (reason) { notify('error', reason instanceof Error ? reason.message : 'Unable to open billing portal.'); setOpeningPortal(false); } }
  return <Card className="md:col-span-2"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-small uppercase tracking-[0.08em] text-accent">Meshly Club</p><h2 className="mt-3 font-heading text-h3">{loading ? 'Loading membership…' : membership ? membership.plan.name : error ? 'Membership unavailable' : 'Not a member yet'}</h2><p className="mt-2 text-small text-text-secondary">{membership ? `${formatEnumLabel(membership.status)} · Renews ${new Date(membership.currentPeriodEnd).toLocaleDateString()}` : error || 'Join for early access and member-only curated drops.'}</p></div>{membership ? <Button variant="secondary" disabled={openingPortal} onClick={() => void openPortal()}>{openingPortal ? 'Opening…' : 'Manage membership'}</Button> : error ? <Button variant="secondary" onClick={loadMembership}>Try again</Button> : <Link href="/club"><Button>Explore Meshly Club</Button></Link>}</div></Card>;
}

function RecentOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadOrders = () => { setLoading(true); setError(''); listOrders(1, 3).then((result) => setOrders(result.items)).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); };
  useEffect(() => { loadOrders(); }, []);
  return <Card className="md:col-span-2"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-small uppercase tracking-[0.08em] text-accent">Recent purchases</p><h2 className="mt-4 font-heading text-h3">Your latest orders</h2></div><Link href="/orders" className="text-small text-text-secondary underline underline-offset-4">View all orders</Link></div>{loading ? <p className="mt-6 text-small text-text-secondary">Loading recent orders…</p> : error ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><p className="text-small text-error">{error}</p><Button size="sm" variant="secondary" onClick={loadOrders}>Try again</Button></div> : orders.length === 0 ? <p className="mt-6 text-small text-text-secondary">No orders yet. Your purchases will appear here.</p> : <div className="mt-6 divide-y divide-border">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><span><span className="block font-mono text-small text-text-primary">{order.id}</span><span className="text-small text-text-secondary">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span></span><span className="font-mono text-small text-primary">${Number(order.totalAmount).toFixed(2)}</span></Link>)}</div>}</Card>;
}

function AccountContent() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <div className="max-w-2xl"><Badge tone="accent">Your account</Badge><h1 className="mt-6 font-heading text-h1">Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1><p className="mt-5 text-body text-text-secondary">Manage your Meshly account and keep your purchases close at hand.</p></div>
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <MembershipPanel />
      <Card><p className="font-mono text-small uppercase tracking-[0.08em] text-accent">Profile</p><h2 className="mt-4 font-heading text-h3">Personal details</h2><dl className="mt-6 space-y-4 text-small"><div className="flex justify-between gap-4 border-b border-border pb-3"><dt className="text-text-secondary">Name</dt><dd className="text-right text-primary">{user.name || 'Not provided'}</dd></div><div className="flex justify-between gap-4 border-b border-border pb-3"><dt className="text-text-secondary">Email</dt><dd className="text-right text-primary">{user.email}</dd></div><div className="flex justify-between gap-4"><dt className="text-text-secondary">Account type</dt><dd className="text-right capitalize text-primary">{user.role.toLowerCase()}</dd></div></dl></Card>
      <RecentOrdersPanel />
      <Card className="md:col-span-2"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-heading text-h3">Sign out</h2><p className="mt-2 text-small text-text-secondary">End your current Meshly session on this device.</p></div><Button variant="secondary" onClick={() => void signOut()}>Sign out</Button></div></Card>
    </div>
  </div>;
}

export default function AccountPage() { return <ProtectedRoute><AccountContent /></ProtectedRoute>; }
