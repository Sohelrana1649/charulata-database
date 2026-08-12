import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import attributeRoutes from './attribute.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import reviewRoutes from './review.routes';
import deliveryRoutes from './delivery.routes';
import bannerRoutes from './banner.routes';
import adminRoleRoutes from './adminRole.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from '../analytics/analytics.routes';
import uploadRoutes from './upload.routes';
import subscriberRoutes from './subscriber.routes';
import contactRoutes from './contact.routes';
import settingsRoutes from './settings.route';
import campaignRoutes from './campaign.routes';
import { getLandingData } from '../controllers/landing.controller';

const router = Router();

// Combined landing page endpoint — returns all home page data in one fast request
router.get('/landing', getLandingData);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/attributes', attributeRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/banners', bannerRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/roles', adminRoleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/contacts', contactRoutes);
router.use('/settings', settingsRoutes);

export default router;

