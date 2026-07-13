import mongoose, { Schema, Document } from 'mongoose';

export interface IImage {
  public_id: string;
  url: string;
  secure_url: string;
  is_primary: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: 'shirts' | 'pant' | 'perfume' | 'watches';
  price: number;
  comparePrice: number;
  images: IImage[];
  brand: string;
  stock: number;
  sizes: string[];
  colors: string[];
  specifications: Map<string, string>;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  discount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: {
        values: ['shirts', 'pant', 'perfume', 'watches'],
        message: '{VALUE} is not a valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      default: 0,
      min: [0, 'Compare price cannot be negative'],
    },
    images: {
      type: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        secure_url: { type: String, required: true },
        is_primary: { type: Boolean, default: false },
      }],
      default: [],
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });

productSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    if (Array.isArray(ret.images)) {
      ret.images = ret.images.map((img: any, index: number) => {
        if (img && typeof img === 'object' && img.public_id) return img;
        const url = typeof img === 'string' ? img : '';
        return {
          public_id: url ? `legacy_${index}_${Date.now()}` : '',
          url,
          secure_url: url,
          is_primary: index === 0,
        };
      });
    }
    return ret;
  },
});

productSchema.set('toObject', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    if (Array.isArray(ret.images)) {
      ret.images = ret.images.map((img: any, index: number) => {
        if (img && typeof img === 'object' && img.public_id) return img;
        const url = typeof img === 'string' ? img : '';
        return {
          public_id: url ? `legacy_${index}_${Date.now()}` : '',
          url,
          secure_url: url,
          is_primary: index === 0,
        };
      });
    }
    return ret;
  },
});

const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
