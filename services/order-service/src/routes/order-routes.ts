import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/async-handler';
import { orderController } from '../controllers/order-controller';
export const orderRouter = Router();
orderRouter.use(requireAuth);
orderRouter.post('/', asyncHandler(orderController.create));
orderRouter.get('/', asyncHandler(orderController.list));
orderRouter.get('/:id', asyncHandler(orderController.getById));
