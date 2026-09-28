import { apiFetch } from '../../lib/api-client';

export type SubscriptionPlan = { id: string; name: string; interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY'; amount: number | string; currency: string; stripePriceId: string; active: boolean };
export type Membership = { id: string; userId: string; planId: string; stripeCustomerId: string; stripeSubscriptionId: string; status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | 'INCOMPLETE'; currentPeriodStart: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean; plan: SubscriptionPlan } | null;

export const listClubPlans = () => apiFetch<SubscriptionPlan[]>('/api/subscriptions/plans');
export const getMembership = () => apiFetch<Membership>('/api/subscriptions/me');
export const createSubscriptionCheckout = (planId: string) => apiFetch<{ url: string; sessionId: string }>('/api/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ planId }) });
export const createBillingPortal = () => apiFetch<{ url: string }>('/api/subscriptions/portal', { method: 'POST', body: JSON.stringify({}) });
