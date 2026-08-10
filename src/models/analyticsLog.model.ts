import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalyticsLog extends Document {
  eventType: 'ProductView' | 'CartAdd' | 'CheckoutStart' | 'CheckoutSuccess' | 'Search' | 'UserActivity';
  user?: Types.ObjectId;
  product?: Types.ObjectId;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const analyticsLogSchema = new Schema<IAnalyticsLog>(
  {
    eventType: {
      type: String,
      enum: ['ProductView', 'CartAdd', 'CheckoutStart', 'CheckoutSuccess', 'Search', 'UserActivity'],
      required: true,
      index: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
  }
);

export const AnalyticsLog = model<IAnalyticsLog>('AnalyticsLog', analyticsLogSchema);
