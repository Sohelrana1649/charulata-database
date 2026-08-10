import { Router } from 'express';
import * as subscriberController from '../controllers/subscriber.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/', subscriberController.subscribeEmail);
router.post('/unsubscribe', subscriberController.unsubscribeEmail);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));
router.get('/', subscriberController.getAllSubscribers);
router.post('/send-promotion', subscriberController.sendPromotionalEmail);

export default router;
