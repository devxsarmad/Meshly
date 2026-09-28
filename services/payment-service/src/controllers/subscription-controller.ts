import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { subscriptionService } from '../services/subscription-service';

const checkoutSchema = z.object({ planId: z.string().uuid() });
const userId = (request: AuthenticatedRequest): string => request.userId as string;

export const subscriptionController = {
  listPlans: async (_request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Subscription plans retrieved', data: await subscriptionService.listPlans() }),
  checkout: async (request: AuthenticatedRequest, response: Response) => { const { planId } = checkoutSchema.parse(request.body); response.status(201).json({ success: true, message: 'Subscription checkout created', data: await subscriptionService.createCheckout(userId(request), planId) }); },
  me: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Membership retrieved', data: await subscriptionService.getCurrent(userId(request)) }),
  portal: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Billing portal created', data: await subscriptionService.createPortal(userId(request)) }),
};
