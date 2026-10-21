import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameBn: string;
  slug: string;
  description?: string;
  image?: string;
  level: number; // 0 = Parent / Root, 1 = Subcategory / Child
  parentCategory?: Types.ObjectId | null;
  order: number;
  attributes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true },
    nameBn: { type: String, required: [true, 'ক্যাটাগরির বাংলা নাম আবশ্যক'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { type: String },
    level: { type: Number, default: 0, index: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    order: { type: Number, default: 0, index: true },
    attributes: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound indexes for sorting and hierarchical lookups
categorySchema.index({ level: 1, order: 1 });
categorySchema.index({ parentCategory: 1, order: 1 });
categorySchema.index({ isActive: 1, order: 1 });

export const Category = model<ICategory>('Category', categorySchema);

