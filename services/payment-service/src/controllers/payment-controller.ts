import { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middlewares/auth';
import { paymentService } from '../services/payment-service';

const createIntentSchema = z.object({ orderId: z.string().uuid() });
const stripe = new Stripe(env.stripeSecretKey);

export const paymentController = {
  createIntent: async (request: AuthenticatedRequest, response: Response) => {
    const { orderId } = createIntentSchema.parse(request.body);
    response.json({ success: true, message: 'Payment intent retrieved', data: await paymentService.createIntentForOrder(orderId, request.userId as string) });
  },
  webhook: async (request: Request, response: Response) => {
    console.log('[payment-service] Stripe webhook request received');
    const signature = request.headers['stripe-signature'];
    if (typeof signature !== 'string') { response.status(400).json({ success: false, message: 'Missing Stripe signature' }); return; }
    let event: Stripe.Event;
    try {
      // Stripe signs the exact raw bytes; parsing this body as JSON before verification would invalidate the signature.
      event = stripe.webhooks.constructEvent(request.body as Buffer, signature, env.stripeWebhookSecret);
    } catch (error) {
      console.error('[payment-service] Stripe webhook signature verification failed', error instanceof Error ? error.message : error);
      response.status(400).json({ success: false, message: `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Invalid signature'}` });
      return;
    }
    console.log(`[payment-service] Stripe webhook signature verified: ${event.type} (${event.id})`);
    try {
      await paymentService.handleStripeWebhook(event);
      response.json({ received: true });
    } catch (error) {
      console.error('[payment-service] Stripe webhook processing failed', error);
      response.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  },
};
