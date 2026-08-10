import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public route to fetch settings (Logos, Advance Payment Amount, Rules, Shipping Charges)
router.get('/', settingsController.getSettings);

// Protected Admin / Super Admin route to update settings
router.patch('/', protect, restrictTo('admin', 'super_admin'), settingsController.updateSettings);

export default router;
