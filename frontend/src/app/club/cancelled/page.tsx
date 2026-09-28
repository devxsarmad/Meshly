'use client';

import Link from 'next/link';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { ProtectedRoute } from '../../../features/auth/components/protected-route';

export default function ClubCancelledPage() { return <ProtectedRoute><div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="mx-auto max-w-2xl text-center"><Badge tone="error">Checkout cancelled</Badge><h1 className="mt-6 font-heading text-h1">No membership was started.</h1><p className="mt-5 text-body text-text-secondary">Nothing was charged. You can return to Meshly Club whenever you are ready.</p><Link href="/club"><Button className="mt-8">Return to Meshly Club</Button></Link></Card></div></ProtectedRoute>; }
