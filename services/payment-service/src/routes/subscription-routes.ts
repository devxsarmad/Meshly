import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { subscriptionController } from '../controllers/subscription-controller';

export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);
subscriptionRouter.get('/plans', (request, response, next) => { void subscriptionController.listPlans(request, response).catch(next); });
subscriptionRouter.post('/checkout', (request, response, next) => { void subscriptionController.checkout(request, response).catch(next); });
subscriptionRouter.get('/me', (request, response, next) => { void subscriptionController.me(request, response).catch(next); });
subscriptionRouter.post('/portal', (request, response, next) => { void subscriptionController.portal(request, response).catch(next); });
