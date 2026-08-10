import { Schema, model, Document, Types } from 'mongoose';

export type DeliveryStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for delivery'
  | 'Delivered'
  | 'Cancelled';

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number; // captured price at checkout
  selectedColor?: string;
  selectedSize?: string;
  selectedAttributes?: Record<string, string>;
}

export interface ITimelineEvent {
  status: DeliveryStatus;
  title: string;
  description?: string;
  timestamp: Date;
}

export interface IShippingAddress {
  recipientName: string;
  recipientPhone: string;
  district: string;
  addressLine: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  shippingCharge: number;
  subTotal: number;
  discount: number;
  totalAmount: number;
  advanceRequired: boolean;
  advanceAmount: number;
  paymentNumber?: string;
  remainingAmount: number;
  couponCode?: string;
  paymentMethod: 'COD' | 'bkash' | 'nagad' | 'rocket';
  paymentSenderNumber?: string;
  transactionId?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Not Required';
  deliveryStatus: DeliveryStatus;
  deliveryNotes?: string;
  estimatedDeliveryDate?: Date;
  timeline: ITimelineEvent[];
  confirmedAt?: Date;
  processedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  selectedColor: { type: String },
  selectedSize: { type: String },
  selectedAttributes: { type: Map, of: String }
});

const timelineEventSchema = new Schema<ITimelineEvent>({
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  district: { type: String, required: true },
  addressLine: { type: String, required: true }
});

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    shippingCharge: { type: Number, required: true, default: 0 },
    subTotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    advanceRequired: { type: Boolean, default: false },
    advanceAmount: { type: Number, default: 0 },
    paymentNumber: { type: String },
    remainingAmount: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: { type: String, enum: ['COD', 'bkash', 'nagad', 'rocket'], default: 'COD', required: true },
    paymentSenderNumber: { type: String },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Not Required'], default: 'Pending', required: true },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
      required: true,
      index: true
    },
    deliveryNotes: { type: String },
    estimatedDeliveryDate: { type: Date },
    timeline: [timelineEventSchema],
    confirmedAt: { type: Date },
    processedAt: { type: Date },
    packedAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
