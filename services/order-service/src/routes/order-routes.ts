import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { orderController } from '../controllers/order-controller';
export const orderRouter = Router();
orderRouter.use(requireAuth);
orderRouter.post('/', orderController.create);
orderRouter.get('/', orderController.list);
orderRouter.get('/:id', orderController.getById);
