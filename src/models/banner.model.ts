import { Schema, model, Document } from 'mongoose';

export interface IBanner extends Document {
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const Banner = model<IBanner>('Banner', bannerSchema);
