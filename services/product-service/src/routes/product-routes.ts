import { Router } from 'express';
import { productController } from '../controllers/product-controller';
import { requireAdmin, requireAuth } from '../middlewares/auth';

export const productRouter = Router();
productRouter.get('/', productController.list);
productRouter.get('/:id/reviews', productController.listReviews);
productRouter.post('/:id/reviews', requireAuth, productController.upsertReview);
productRouter.get('/:id', productController.getById);
productRouter.post('/', requireAdmin, productController.create);
productRouter.patch('/:id', requireAdmin, productController.update);
productRouter.delete('/:id', requireAdmin, productController.remove);
