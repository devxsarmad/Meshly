import { Router } from 'express';
import { paymentController } from '../controllers/payment-controller';
import { requireAuth } from '../middlewares/auth';

export const paymentRouter = Router();
paymentRouter.post('/create-intent', requireAuth, (request, response, next) => { void paymentController.createIntent(request, response).catch(next); });
