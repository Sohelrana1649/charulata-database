import { Schema, model, Document, Types } from 'mongoose';

export interface IProductAttribute {
  name: string;
  options: string[];
}

export interface IVariant {
  color?: string;
  size?: string;
  price?: number;
  stockQuantity: number;
  sku?: string;
  image?: string;
  attributes?: Record<string, string>;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  productImages: string[];
  videoUrl?: string;
  attributes?: IProductAttribute[];
  variants: IVariant[];
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  sku: string;
  category: Types.ObjectId;
  tags: string[];
  bestSelling: boolean;
  newArrival: boolean;
  flashSale: boolean;
  discountStartDate?: Date;
  discountEndDate?: Date;
  views: number;
  badge?: string;
  isActive: boolean;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>({
  color: { type: String },
  size: { type: String },
  price: { type: Number },
  stockQuantity: { type: Number, required: true, default: 0 },
  sku: { type: String },
  image: { type: String },
  attributes: { type: Map, of: String }
});

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: [true, 'Product title is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: [true, 'Product description is required'] },
    price: { type: Number, required: [true, 'Product price is required'], min: 0 },
    salePrice: { type: Number, min: 0 },
    productImages: [{ type: String, required: true }],
    videoUrl: { type: String, trim: true },
    attributes: [
      {
        name: { type: String, required: true },
        options: [{ type: String }]
      }
    ],
    variants: [variantSchema],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stockQuantity: { type: Number, required: [true, 'Stock quantity is required'], min: 0, default: 0 },
    sku: { type: String, required: [true, 'Product SKU is required'], unique: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, 'Product category is required'] },
    tags: [{ type: String }],
    bestSelling: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    flashSale: { type: Boolean, default: false, index: true },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
    views: { type: Number, default: 0 },
    badge: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Create compound text index for searching
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound indexes for ultra-fast landing page & category listing queries
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, bestSelling: 1, createdAt: -1 });
productSchema.index({ isActive: 1, newArrival: 1, createdAt: -1 });
productSchema.index({ isActive: 1, flashSale: 1, createdAt: -1 });

// Price & Rating sorting indexes for instant sorting response
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, price: -1 });
productSchema.index({ isActive: 1, 'ratings.average': -1 });

export const Product = model<IProduct>('Product', productSchema);
