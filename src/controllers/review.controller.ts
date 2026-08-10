import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ReviewService } from '../services/review.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const createReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const review = await ReviewService.createReview(userId, req.body);
  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

export const getProductReviews = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const productId = req.params.productId as string;
  const reviews = await ReviewService.getProductReviews(productId);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

export const getApprovedReviews = catchAsync(async (req: any, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
  const reviews = await ReviewService.getApprovedReviews(limit);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

export const getAllReviews = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const reviews = await ReviewService.getAllReviews();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

export const updateReviewStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const review = await ReviewService.updateReviewStatus(id, status);
  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

export const deleteReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const isAdmin = ['admin', 'super_admin', 'staff'].includes(req.user!.role || '');
  const id = req.params.id as string;
  const result = await ReviewService.deleteReview(id, userId, isAdmin);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const bulkReviewAction = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !['approve', 'reject', 'delete'].includes(action)) {
    throw new AppError('Invalid request parameters for bulk action', 400);
  }

  const result = await ReviewService.bulkAction(ids, action);
  res.status(200).json({
    status: 'success',
    data: result
  });
});
