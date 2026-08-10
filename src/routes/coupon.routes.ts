import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Publicly validate coupon (protect to ensure user is logged in, but not restricted)
router.post('/validate', protect, couponController.validateCoupon);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));

router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.get('/:id', couponController.getCouponById);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
