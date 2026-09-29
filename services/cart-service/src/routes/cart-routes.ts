import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { cartController } from '../controllers/cart-controller';
import { wishlistController } from '../controllers/wishlist-controller';

export const cartRouter = Router();
cartRouter.use(requireAuth);
cartRouter.get('/', cartController.get);
cartRouter.post('/items', cartController.addItem);
cartRouter.patch('/items/:productId', cartController.updateItem);
cartRouter.delete('/items/:productId', cartController.removeItem);
cartRouter.delete('/', cartController.clear);
cartRouter.get('/wishlist', wishlistController.get);
cartRouter.post('/wishlist', wishlistController.addItem);
cartRouter.delete('/wishlist/:productId', wishlistController.removeItem);
