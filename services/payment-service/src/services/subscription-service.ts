import Stripe from 'stripe';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { env } from '../config/env';
import { publishSubscriptionEvent } from '../events/payment-events';
import { subscriptionRepository } from '../repositories/subscription-repository';
import { AppError } from '../utils/errors';

const stripe = new Stripe(env.stripeSecretKey);

const dateFromUnix = (value: number | null | undefined): Date => value ? new Date(value * 1000) : new Date();
const statusFromStripe = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  if (status === 'active' || status === 'trialing') return SubscriptionStatus.ACTIVE;
  if (status === 'past_due' || status === 'unpaid') return SubscriptionStatus.PAST_DUE;
  if (status === 'canceled') return SubscriptionStatus.CANCELLED;
  if (status === 'incomplete') return SubscriptionStatus.INCOMPLETE;
  return SubscriptionStatus.EXPIRED;
};
const customerId = (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null => typeof customer === 'string' ? customer : customer?.id ?? null;
const subscriptionId = (subscription: string | Stripe.Subscription | null): string | null => typeof subscription === 'string' ? subscription : subscription?.id ?? null;
const periodDates = (subscription: Stripe.Subscription) => ({ currentPeriodStart: dateFromUnix(subscription.items.data[0]?.current_period_start ?? subscription.billing_cycle_anchor), currentPeriodEnd: dateFromUnix(subscription.items.data[0]?.current_period_end ?? subscription.billing_cycle_anchor) });
const invoiceSubscriptionId = (invoice: Stripe.Invoice): string | null => subscriptionId(invoice.parent?.subscription_details?.subscription ?? null);

async function saveSubscription(userId: string, planId: string, customer: string, subscription: Stripe.Subscription) {
  const data = {
    stripeCustomerId: customer,
    status: statusFromStripe(subscription.status),
    ...periodDates(subscription),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
  const existing = await subscriptionRepository.findByStripeId(subscription.id);
  if (existing) return subscriptionRepository.updateByStripeId(subscription.id, data);
  return subscriptionRepository.create({ userId, plan: { connect: { id: planId } }, stripeSubscriptionId: subscription.id, ...data });
}

export const subscriptionService = {
  listPlans: () => subscriptionRepository.listActivePlans(),
  async createCheckout(userId: string, planId: string) {
    const plan = await subscriptionRepository.findPlan(planId);
    if (!plan) throw new AppError(404, 'Subscription plan not found');
    const current = await subscriptionRepository.findCurrentByUser(userId);
    if (current) {
      throw new AppError(
        409,
        'You already have an active Meshly Club membership. Manage it from your account.',
      );
    }
    const existingCustomer = await subscriptionRepository.findLatestCustomerByUser(userId);
    const customer = existingCustomer?.stripeCustomerId ?? (await stripe.customers.create({ metadata: { userId } })).id;
    const session = await stripe.checkout.sessions.create({ mode: 'subscription', customer, line_items: [{ price: plan.stripePriceId, quantity: 1 }], success_url: `${env.clubSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`, cancel_url: env.clubCancelUrl, metadata: { userId, planId }, subscription_data: { metadata: { userId, planId } }, allow_promotion_codes: true });
    if (!session.url) throw new AppError(502, 'Stripe did not return a checkout URL');
    return { url: session.url, sessionId: session.id };
  },
  async getCurrent(userId: string) { return subscriptionRepository.findCurrentByUser(userId); },
  async createPortal(userId: string) {
    const customer = await subscriptionRepository.findLatestCustomerByUser(userId);
    if (!customer) throw new AppError(404, 'No Meshly Club billing profile found');
    const session = await stripe.billingPortal.sessions.create({ customer: customer.stripeCustomerId, return_url: env.clubPortalReturnUrl });
    return { url: session.url };
  },
  async handleWebhook(event: Stripe.Event) {
    const supported = ['checkout.session.completed', 'invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated', 'customer.subscription.deleted'];
    if (!supported.includes(event.type)) return;
    const eventData = JSON.parse(JSON.stringify(event.data.object)) as Prisma.InputJsonValue;
    const recorded = await subscriptionRepository.createEventIfNew({ stripeEventId: event.id, type: event.type, payload: eventData });
    if (!recorded.created) { console.log(`[payment-service] Ignoring duplicate subscription event ${event.id}`); return; }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripeSubId = subscriptionId(session.subscription);
      const customer = customerId(session.customer);
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (!stripeSubId || !customer || !userId || !planId) { console.warn(`[payment-service] Subscription checkout event ${event.id} is missing metadata`); return; }
      const subscription = await stripe.subscriptions.retrieve(stripeSubId);
      const saved = await saveSubscription(userId, planId, customer, subscription);
      publishSubscriptionEvent('subscription.activated', { eventName: 'SubscriptionActivated', subscriptionId: saved.id, userId, planId, stripeSubscriptionId: stripeSubId });
      console.log(`[payment-service] Meshly Club subscription activated: ${stripeSubId}`);
      return;
    }

    const stripeSubscription = event.data.object as Stripe.Subscription | Stripe.Invoice;
    const stripeSubId = event.type.startsWith('invoice.') ? invoiceSubscriptionId(stripeSubscription as Stripe.Invoice) : (stripeSubscription as Stripe.Subscription).id;
    if (!stripeSubId) { console.warn(`[payment-service] Subscription event ${event.id} has no subscription id`); return; }
    const existing = await subscriptionRepository.findByStripeId(stripeSubId);
    if (!existing) { console.warn(`[payment-service] Subscription event ${event.id} references unknown subscription ${stripeSubId}`); return; }
    const subscription = event.type.startsWith('invoice.') ? await stripe.subscriptions.retrieve(stripeSubId) : stripeSubscription as Stripe.Subscription;
    const status = event.type === 'invoice.payment_failed' ? SubscriptionStatus.PAST_DUE : event.type === 'customer.subscription.deleted' ? SubscriptionStatus.CANCELLED : statusFromStripe(subscription.status);
    const updated = await subscriptionRepository.updateByStripeId(stripeSubId, { status, ...periodDates(subscription), cancelAtPeriodEnd: subscription.cancel_at_period_end });
    const routingKey = event.type === 'invoice.payment_failed' ? 'subscription.payment_failed' : event.type === 'customer.subscription.deleted' ? 'subscription.cancelled' : 'subscription.activated';
    publishSubscriptionEvent(routingKey, { eventName: routingKey === 'subscription.payment_failed' ? 'SubscriptionPaymentFailed' : routingKey === 'subscription.cancelled' ? 'SubscriptionCancelled' : 'SubscriptionActivated', subscriptionId: updated.id, userId: updated.userId, status });
    console.log(`[payment-service] Subscription event processed: ${event.type} -> ${status}; published ${routingKey}`);
  },
};
