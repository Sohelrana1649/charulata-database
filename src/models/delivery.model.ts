import { Schema, model, Document } from 'mongoose';

export interface IDeliveryZone extends Document {
  district: string; // e.g. "Dhaka", "Chittagong", "Sylhet", "Gazipur"
  shippingCharge: number;
  estimatedDeliveryTime: string; // e.g., "1-2 Days", "3-5 Days"
  courierName?: string; // e.g., "Pathao Courier", "Steadfast", "RedX"
  codAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    district: { type: String, required: true, unique: true, trim: true, index: true },
    shippingCharge: { type: Number, required: true, min: 0 },
    estimatedDeliveryTime: { type: String, required: true, default: '3-5 Days' },
    courierName: { type: String, default: 'Default Courier' },
    codAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const DeliveryZone = model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
