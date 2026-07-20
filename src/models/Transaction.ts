import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionRefund {
  amount: number;
  reason: string;
  status: string;
  transactionId: string;
  createdAt: Date;
}

export interface ITransaction extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  metadata: Record<string, unknown>;
  responseBody: Record<string, unknown>;
  refunds: ITransactionRefund[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionRefundSchema = new Schema<ITransactionRefund>({
  amount: { type: Number, required: true },
  reason: { type: String, default: '' },
  status: { type: String, required: true },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const transactionSchema = new Schema<ITransaction>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['stripe', 'easypaisa', 'jazzcash', 'payfast'],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'PKR' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    responseBody: { type: Schema.Types.Mixed, default: {} },
    refunds: { type: [transactionRefundSchema], default: [] },
  },
  { timestamps: true }
);

transactionSchema.index({ provider: 1, transactionId: 1 }, { unique: true });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
