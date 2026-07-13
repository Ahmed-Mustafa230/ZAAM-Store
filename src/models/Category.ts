import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const Category =
  mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;
