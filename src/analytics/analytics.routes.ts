import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all routes: Admin/Staff only
router.use(protect, restrictTo('admin', 'staff'));

router.get('/overview', analyticsController.getDashboardOverview);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/sales-chart', analyticsController.getSalesChartData);
router.get('/orders', analyticsController.getOrdersAnalytics);
router.get('/customers', analyticsController.getCustomerAnalytics);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/reviews', analyticsController.getReviewAnalytics);
router.get('/categories', analyticsController.getCategoryAnalytics);
router.get('/recent-orders', analyticsController.getRecentOrders);
router.get('/notifications', analyticsController.getNotificationAnalytics);
router.get('/export', analyticsController.exportAnalytics);

export default router;
