import { Review } from '../models/review.model';
import { Product } from '../models/product.model';
import { AppError } from '../utils/appError';

export class ReviewService {
  static async createReview(userId: string, data: any) {
    const { product, rating, comment } = data;

    // Check if product exists
    const prod = await Product.findById(product);
    if (!prod) throw new AppError('Product not found', 404);

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ customer: userId, product });
    if (existingReview) {
      throw new AppError('You have already reviewed this product.', 400);
    }

    // Create review (defaults to Pending status)
    return Review.create({
      customer: userId,
      product,
      rating,
      comment,
      status: 'Pending'
    });
  }

  static async getProductReviews(productId: string) {
    return Review.find({ product: productId, status: 'Approved' })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });
  }

  static async getApprovedReviews(limit: number = 3) {
    return Review.find({ status: 'Approved', rating: { $gte: 4 } })
      .populate('customer', 'name profileImage')
      .populate('product', 'title slug')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  static async getAllReviews() {
    return Review.find()
      .populate('customer', 'name email')
      .populate('product', 'title slug')
      .sort({ createdAt: -1 });
  }

  static async updateReviewStatus(id: string, status: 'Approved' | 'Rejected') {
    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    review.status = status;
    await review.save(); // triggers rating calculation hook
    return review;
  }

  static async deleteReview(id: string, userId: string, isAdmin: boolean) {
    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    // Only creator or admin can delete
    if (!isAdmin && review.customer.toString() !== userId) {
      throw new AppError('You do not have permission to delete this review', 403);
    }

    await review.deleteOne(); // triggers rating calculation hook
    return { message: 'Review deleted successfully' };
  }

  static async bulkAction(ids: string[], action: 'approve' | 'reject' | 'delete') {
    const reviews = await Review.find({ _id: { $in: ids } });
    if (reviews.length === 0) {
      throw new AppError('No matching reviews found', 44);
    }

    if (action === 'delete') {
      for (const review of reviews) {
        await review.deleteOne(); // triggers product rating calculation hooks
      }
      return { message: `Successfully deleted ${reviews.length} reviews` };
    }

    const targetStatus = action === 'approve' ? 'Approved' : 'Rejected';
    for (const review of reviews) {
      review.status = targetStatus;
      await review.save(); // triggers product rating calculation hooks
    }

    return { message: `Successfully updated ${reviews.length} reviews to ${targetStatus}` };
  }
}
