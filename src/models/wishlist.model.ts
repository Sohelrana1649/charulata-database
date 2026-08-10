import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  customer: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
