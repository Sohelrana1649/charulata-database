import { Schema, model, Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  subtitle?: string;
  badgeText?: string;
  description?: string;
  discountPercent?: number;
  startDate?: Date;
  endDate?: Date;
  ctaText?: string;
  ctaLink?: string;
  bannerImage1?: string;
  bannerImage2?: string;
  images?: string[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    badgeText: { type: String, trim: true },
    description: { type: String, trim: true },
    discountPercent: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    ctaText: { type: String, default: 'অফার প্রোডাক্টস দেখুন' },
    ctaLink: { type: String, default: '/search' },
    bannerImage1: { type: String },
    bannerImage2: { type: String },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>('Campaign', campaignSchema);
