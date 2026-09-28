'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { MeshlyLoader } from '../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../features/auth/components/protected-route';
import { createSubscriptionCheckout, listClubPlans, type SubscriptionPlan } from '../../features/subscriptions/api';
import { formatEnumLabel } from '../../lib/formatters';
import { notify } from '../../lib/toast';

function ClubContent() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { listClubPlans().then(setPlans).catch((reason: Error) => { setError(reason.message); notify('error', reason.message); }).finally(() => setLoading(false)); }, []);
  async function subscribe(planId: string) { setSubscribing(planId); try { const checkout = await createSubscriptionCheckout(planId); window.location.assign(checkout.url); } catch (reason) { notify('error', reason instanceof Error ? reason.message : 'Unable to open subscription checkout.'); setSubscribing(''); } }
  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading Meshly Club…" /></div>;
  if (error) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="border-error/30 bg-error/5"><p className="text-error">{error}</p></Card></div>;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><div className="mx-auto max-w-2xl text-center"><Badge tone="accent">Meshly membership</Badge><h1 className="mt-6 font-heading text-h1">More from the things you love.</h1><p className="mt-5 text-body text-text-secondary">Meshly Club brings you early access, considered member drops, and a closer connection to the objects we curate.</p></div><div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">{plans.map((plan) => <Card key={plan.id} className="flex flex-col"><p className="font-mono text-small uppercase tracking-[0.08em] text-accent">{formatEnumLabel(plan.interval)}</p><h2 className="mt-4 font-heading text-h3">{plan.name.replace('Meshly Club ', '')}</h2><p className="mt-4 font-heading text-h1">${Number(plan.amount).toFixed(2)}<span className="font-body text-body text-text-secondary"> / {plan.interval === 'YEARLY' ? 'year' : 'month'}</span></p><ul className="mt-6 flex-1 space-y-3 text-small text-text-secondary"><li>✓ Early access to new collections</li><li>✓ Member-only curated drops</li><li>✓ A more considered Meshly experience</li></ul><Button className="mt-8 w-full" disabled={subscribing === plan.id} onClick={() => void subscribe(plan.id)}>{subscribing === plan.id ? 'Opening checkout…' : 'Subscribe'}</Button></Card>)}</div></div>;
}

export default function ClubPage() { return <ProtectedRoute><ClubContent /></ProtectedRoute>; }
