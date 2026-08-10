import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createOrderSchema, updateOrderStatusSchema, createGuestOrderSchema } from '../validations/order.validation';

const router = Router();

// Public Routes (require no authentication)
router.post('/track', orderController.trackOrder);
router.post('/guest-checkout', validate(createGuestOrderSchema), orderController.guestCheckout);

// Protected Customer/Admin routes
router.use(protect);

router.post('/checkout', validate(createOrderSchema), orderController.checkout);
router.get('/history', orderController.getOrderHistory);
router.get('/:id', orderController.getOrderById);

// Admin / Staff only routes
router.use(restrictTo('admin', 'staff'));

router.get('/', orderController.getAllOrders);
router.patch('/bulk-status', orderController.bulkUpdateOrderStatus);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
