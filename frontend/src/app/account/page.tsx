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

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${active ? 'bg-accent' : 'bg-border'}`}
    />
  );
}

function MembershipPanel() {
  const [membership, setMembership] = useState<Membership>(null);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [error, setError] = useState('');

  const loadMembership = () => {
    setLoading(true);
    setError('');
    getMembership()
      .then(setMembership)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembership();
  }, []);

  async function openPortal() {
    setOpeningPortal(true);
    try {
      const portal = await createBillingPortal();
      window.location.assign(portal.url);
    } catch (reason) {
      notify('error', reason instanceof Error ? reason.message : 'Unable to open billing portal.');
      setOpeningPortal(false);
    }
  }

  const isActive = membership?.status === 'ACTIVE';

  return (
    <Card className="relative overflow-hidden !bg-primary">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-small uppercase tracking-[0.08em] text-white/60">
            Meshly Club
          </p>
          <div className="mt-3 flex items-center gap-2">
            {membership && <StatusDot active={isActive} />}
            <h2 className="font-heading text-h3 text-white">
              {loading
                ? 'Loading membership…'
                : membership
                  ? membership.plan.name
                  : error
                    ? 'Membership unavailable'
                    : 'Not a member yet'}
            </h2>
          </div>
          <p className="mt-2 text-small text-white/70">
            {membership
              ? `${formatEnumLabel(membership.status)} · Renews ${new Date(membership.currentPeriodEnd).toLocaleDateString()}`
              : error || 'Join for early access and member-only curated drops.'}
          </p>
        </div>
        {membership ? (
          <Button variant="secondary" disabled={openingPortal} onClick={() => void openPortal()}>
            {openingPortal ? 'Opening…' : 'Manage membership'}
          </Button>
        ) : error ? (
          <Button variant="secondary" onClick={loadMembership}>
            Try again
          </Button>
        ) : (
          <Link href="/club">
            <Button>Explore Meshly Club</Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

function ProfilePanel() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { label: 'Name', value: user.name || 'Not provided' },
    { label: 'Email', value: user.email },
    { label: 'Account type', value: user.role.toLowerCase() },
  ];

  return (
    <Card>
      <p className="font-mono text-small uppercase tracking-[0.08em] text-accent">Profile</p>
      <h2 className="mt-4 font-heading text-h4">Personal details</h2>
      <dl className="mt-6 space-y-4 text-small">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="text-right capitalize text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function RecentOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    setError('');
    listOrders(1, 3)
      .then((result) => setOrders(result.items))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-small uppercase tracking-[0.08em] text-accent">
            Recent purchases
          </p>
          <h2 className="mt-4 font-heading text-h4">Your latest orders</h2>
        </div>
        <Link href="/orders" className="text-small text-text-secondary underline underline-offset-4 hover:text-accent">
          View all
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-small text-text-secondary">Loading recent orders…</p>
      ) : error ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-small text-error">{error}</p>
          <Button size="sm" variant="secondary" onClick={loadOrders}>
            Try again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-small text-text-secondary">
          No orders yet. Your purchases will appear here.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <span className="block font-mono text-small text-text-primary group-hover:text-accent">
                  {order.id}
                </span>
                <span className="text-small text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className="font-mono text-small text-primary">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function AccountContent() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <Badge tone="accent">Your account</Badge>
          <h1 className="mt-6 font-heading text-h1">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-5 text-body text-text-secondary">
            Manage your Meshly account and keep your purchases close at hand.
          </p>
        </div>
        <button
          onClick={() => void signOut()}
          className="text-small text-text-secondary underline underline-offset-4 hover:text-error"
        >
          Sign out
        </button>
      </div>

      <div className="mt-10">
        <MembershipPanel />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <ProfilePanel />
        <RecentOrdersPanel />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}