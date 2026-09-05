import { Schema, model, Document, Types } from 'mongoose';

export interface ICartSnapshotItem {
  productId?: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ILead extends Document {
  name?: string;
  phone: string;
  cartSnapshot: ICartSnapshotItem[];
  cartTotal?: number;
  capturedAt: Date;
  updatedAt: Date;
  converted: boolean;
  convertedAt?: Date;
  orderId?: Types.ObjectId;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    cartSnapshot: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        name: {
          type: String,
          trim: true
        },
        quantity: {
          type: Number,
          default: 1
        },
        price: {
          type: Number,
          default: 0
        },
        image: {
          type: String
        },
        selectedColor: String,
        selectedSize: String
      }
    ],
    cartTotal: {
      type: Number,
      default: 0
    },
    capturedAt: {
      type: Date,
      default: Date.now
    },
    converted: {
      type: Boolean,
      default: false,
      index: true
    },
    convertedAt: {
      type: Date
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ converted: 1, updatedAt: -1 });

export const Lead = model<ILead>('Lead', leadSchema);
