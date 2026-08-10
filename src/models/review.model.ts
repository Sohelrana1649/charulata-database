import { Schema, model, Document, Types } from 'mongoose';
import { Product } from './product.model';

export interface IReview extends Document {
  customer: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true }
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same user on the same product
reviewSchema.index({ customer: 1, product: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (productId: Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, status: 'Approved' }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.count': stats[0].nRating,
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.count': 0,
      'ratings.average': 0
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function (doc) {
  // @ts-ignore
  doc.constructor.calcAverageRatings(doc.product);
});

// Call calcAverageRatings after deleteOne document action
reviewSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  if (doc) {
    // @ts-ignore
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

// Call calcAverageRatings after updating or deleting
// For findOneAnd... queries
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    // @ts-ignore
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

export const Review = model<IReview>('Review', reviewSchema);
