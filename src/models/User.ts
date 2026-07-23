import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword, comparePassword } from '@/lib/auth';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  avatar: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
  phone: string;
  isBlocked: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  resetOtp: string | null;
  resetOtpExpiry: Date | null;
  resetOtpVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    phone: {
      type: String,
      default: '',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
    resetOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const hashed = await hashPassword(this.password);
  this.password = hashed;
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
