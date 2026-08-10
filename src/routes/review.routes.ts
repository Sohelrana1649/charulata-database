import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Publicly view product reviews
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/approved', reviewController.getApprovedReviews);

// Protected Customer / Admin routes
router.use(protect);

router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

// Admin / Staff only routes
router.use(restrictTo('admin', 'staff'));

router.get('/', reviewController.getAllReviews);
router.patch('/:id/status', reviewController.updateReviewStatus);
router.post('/bulk-action', reviewController.bulkReviewAction);

export default router;
