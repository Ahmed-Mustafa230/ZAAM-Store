import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  name: string;
  passwordHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  usedAt: Date | null;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.otpHash;
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

const Otp = mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
