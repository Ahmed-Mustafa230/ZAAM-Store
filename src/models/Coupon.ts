import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
    },
    discountType: {
      type: String,
      required: [true, 'Please provide a discount type'],
      enum: {
        values: ['percentage', 'flat'],
        message: '{VALUE} is not a valid discount type',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide a discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: [true, 'Please provide a valid from date'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Please provide a valid until date'],
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;
