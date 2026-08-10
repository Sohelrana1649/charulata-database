import { Router } from 'express';
import * as bannerController from '../controllers/banner.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));

router.get('/', bannerController.getAllBanners);
router.post('/', bannerController.createBanner);
router.patch('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export default router;
