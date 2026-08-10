import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middlewares/auth';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
