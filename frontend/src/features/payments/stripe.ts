import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
console.log('Stripe publishable key:', publishableKey);
console.log('Stripe secret key:', secretKey);
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
