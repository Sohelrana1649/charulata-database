import { Schema, model, Document } from 'mongoose';
import { slugify } from '../utils/slugify';

export interface IAttribute extends Document {
  name: string;
  slug: string;
  values: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: [true, 'Attribute name is required'], unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    values: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name before validation
attributeSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
});

export const Attribute = model<IAttribute>('Attribute', attributeSchema);
