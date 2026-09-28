import 'dotenv/config';
import Stripe from 'stripe';
import { PrismaClient, SubscriptionInterval } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

const plans = [
  { name: 'Meshly Club Monthly', interval: SubscriptionInterval.MONTHLY, stripeInterval: 'month' as const, amount: 9.99, envKey: 'STRIPE_PRICE_MONTHLY' },
  { name: 'Meshly Club Yearly', interval: SubscriptionInterval.YEARLY, stripeInterval: 'year' as const, amount: 99, envKey: 'STRIPE_PRICE_YEARLY' },
];

async function findOrCreatePrice(plan: typeof plans[number]) {
  const configured = process.env[plan.envKey];
  if (configured) return configured;
  const products = await stripe.products.list({ active: true, limit: 100 });
  let product = products.data.find((candidate) => candidate.metadata.meshlyPlan === plan.name);
  if (!product) product = await stripe.products.create({ name: plan.name, metadata: { meshlyPlan: plan.name } });
  const prices = await stripe.prices.list({ product: product.id, active: true, type: 'recurring', limit: 100 });
  const existing = prices.data.find((price) => price.recurring?.interval === plan.stripeInterval && price.unit_amount === Math.round(plan.amount * 100) && price.currency === 'usd');
  if (existing) return existing.id;
  const price = await stripe.prices.create({ product: product.id, currency: 'usd', unit_amount: Math.round(plan.amount * 100), recurring: { interval: plan.stripeInterval } });
  return price.id;
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required');
  for (const plan of plans) {
    const stripePriceId = await findOrCreatePrice(plan);
    const saved = await prisma.subscriptionPlan.upsert({ where: { name: plan.name }, create: { name: plan.name, interval: plan.interval, amount: plan.amount, currency: 'usd', stripePriceId, active: true }, update: { interval: plan.interval, amount: plan.amount, currency: 'usd', stripePriceId, active: true } });
    console.log(`[seed] ${saved.name}: ${saved.id} (Stripe price ${saved.stripePriceId})`);
  }
  console.log('[seed] Meshly Club plans are ready. Weekly remains schema-supported but hidden from the UI.');
}

main().catch((error) => { console.error('[seed] Failed', error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
