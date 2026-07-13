import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ product: 1, user: 1 });

reviewSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
