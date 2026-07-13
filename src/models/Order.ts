import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
  size: string;
  color: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: Date;
  isDelivered: boolean;
  deliveredAt: Date;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  trackingNumber: string;
  couponApplied: string;
  discountAmount: number;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        image: { type: String, default: '' },
        size: { type: String, default: '' },
        color: { type: String, default: '' },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please provide a payment method'],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      updateTime: { type: String },
      emailAddress: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    couponApplied: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
