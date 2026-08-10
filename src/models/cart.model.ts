import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  color?: string;
  size?: string;
  selectedAttributes?: Record<string, string>;
}

export interface ICart extends Document {
  customer: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  color: { type: String },
  size: { type: String },
  selectedAttributes: { type: Map, of: String }
});

const cartSchema = new Schema<ICart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

export const Cart = model<ICart>('Cart', cartSchema);
