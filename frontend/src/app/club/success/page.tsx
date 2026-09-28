'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { MeshlyLoader } from '../../../components/ui/meshly-loader';
import { ProtectedRoute } from '../../../features/auth/components/protected-route';
import { getMembership, type Membership } from '../../../features/subscriptions/api';
import { notify } from '../../../lib/toast';

function SuccessContent() {
  const [membership, setMembership] = useState<Membership>(null);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; let attempts = 0; let timer: ReturnType<typeof setTimeout> | undefined; const poll = async () => { try { const current = await getMembership(); if (!active) return; setMembership(current); if (current?.status === 'ACTIVE') return; } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : 'We could not load your membership.'); } attempts += 1; if (active && attempts < 10) timer = setTimeout(() => void poll(), 2000); else if (active && !membership) notify('warning', 'Stripe is still confirming your membership. Check your account shortly.'); }; void poll(); return () => { active = false; if (timer) clearTimeout(timer); }; }, []);
  if (membership?.status === 'ACTIVE') return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl text-center"><Badge tone="success">Membership active</Badge><h1 className="mt-6 font-heading text-h1">Welcome to Meshly Club.</h1><p className="mt-5 text-body text-text-secondary">Your {membership.plan.name} membership is active through {new Date(membership.currentPeriodEnd).toLocaleDateString()}.</p><Link href="/account"><Button className="mt-8">View your account</Button></Link></Card></div>;
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl text-center"><Badge tone="accent">Payment received</Badge><h1 className="mt-6 font-heading text-h1">Confirming your membership.</h1>{error ? <p className="mt-5 text-error">{error}</p> : <MeshlyLoader label="Waiting for Stripe confirmation…" />}<p className="mt-6 text-small text-text-secondary">This can take a few seconds. You can safely return to your account.</p><Link href="/account"><Button className="mt-8" variant="secondary">Go to account</Button></Link></Card></div>;
}

export default function ClubSuccessPage() { return <ProtectedRoute><SuccessContent /></ProtectedRoute>; }
