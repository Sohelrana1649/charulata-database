import { Schema, model, Document } from 'mongoose';

export interface IThana {
  nameEn: string;
  nameBn: string;
}

export interface IDeliveryZone extends Document {
  district: string; // e.g. "Dhaka(ঢাকা)", "Rajshahi(রাজশাহী)"
  nameEn?: string;  // e.g. "Dhaka"
  nameBn?: string;  // e.g. "ঢাকা"
  division?: string;
  divisionEn?: string; // e.g. "Dhaka"
  divisionBn?: string; // e.g. "ঢাকা"
  thanas?: IThana[];
  shippingCharge: number;
  estimatedDeliveryTime: string; // e.g., "1-2 Days", "3-5 Days"
  courierName?: string; // e.g., "Pathao Courier", "Steadfast", "RedX"
  codAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const thanaSchema = new Schema<IThana>(
  {
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    district: { type: String, required: true, unique: true, trim: true, index: true },
    nameEn: { type: String, trim: true },
    nameBn: { type: String, trim: true },
    division: { type: String, trim: true },
    divisionEn: { type: String, trim: true },
    divisionBn: { type: String, trim: true },
    thanas: { type: [thanaSchema], default: [] },
    shippingCharge: { type: Number, required: true, min: 0 },
    estimatedDeliveryTime: { type: String, required: true, default: '3-5 Days' },
    courierName: { type: String, default: 'Default Courier' },
    codAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const DeliveryZone = model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
