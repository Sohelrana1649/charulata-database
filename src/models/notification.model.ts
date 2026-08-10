import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient?: Types.ObjectId; // null/undefined means global or admin
  type: 'NewOrder' | 'StockAlert' | 'UserActivity' | 'General';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ['NewOrder', 'StockAlert', 'UserActivity', 'General'],
      default: 'General',
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
