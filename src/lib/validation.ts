import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .transform((v) => v.trim())
    .optional(),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional(),
  avatar: z
    .string()
    .max(500, 'Avatar URL is too long')
    .optional(),
  addresses: z
    .array(
      z.object({
        street: z.string().min(1, 'Street is required').max(200),
        city: z.string().min(1, 'City is required').max(100),
        state: z.string().min(1, 'State is required').max(100),
        zip: z.string().min(1, 'ZIP code is required').max(20),
        country: z.string().min(1, 'Country is required').max(100),
        isDefault: z.boolean().default(false),
      })
    )
    .optional(),
});

const imageSchema = z.object({
  public_id: z.string().min(1),
  url: z.string(),
  secure_url: z.string(),
  is_primary: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name cannot exceed 200 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category: z.enum(['shirts', 'pants', 'perfumes', 'watches']),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(9999999.99, 'Price is too high'),
  comparePrice: z.number().min(0).max(9999999.99).default(0).optional(),
  images: z.array(imageSchema).default([]).optional(),
  brand: z.string().max(200).default('').optional(),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock is too high'),
  sizes: z.array(z.string().max(50)).default([]).optional(),
  colors: z.array(z.string().max(50)).default([]).optional(),
  specifications: z.record(z.string(), z.string()).default({}).optional(),
  isFeatured: z.boolean().default(false).optional(),
  isNew: z.boolean().default(true).optional(),
  discount: z.number().min(0).max(100).default(0).optional(),
  tags: z.array(z.string().max(100)).default([]).optional(),
});

export const productUpdateSchema = productSchema.partial();

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1, 'Product ID is required'),
        quantity: z
          .number()
          .int('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1')
          .max(100, 'Quantity cannot exceed 100'),
        size: z.string().max(50).default('').optional(),
        color: z.string().max(50).default('').optional(),
      })
    )
    .min(1, 'Please add at least one item'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zip: z.string().min(1, 'ZIP code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
  }),
  paymentMethod: z
    .string()
    .min(1, 'Payment method is required')
    .max(50),
  couponApplied: z.string().max(50).default('').optional(),
  discountAmount: z.number().min(0).default(0).optional(),
});

export const orderUpdateSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  trackingNumber: z.string().max(100).optional(),
  isPaid: z.boolean().optional(),
  isDelivered: z.boolean().optional(),
  paymentResult: z
    .object({
      id: z.string().optional(),
      status: z.string().optional(),
      updateTime: z.string().optional(),
      emailAddress: z.string().optional(),
    })
    .optional(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code is too long')
    .transform((v) => v.toUpperCase().trim()),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z
    .number()
    .positive('Discount value must be positive')
    .max(999999.99, 'Discount value is too high'),
  minPurchase: z.number().min(0).default(0).optional(),
  maxDiscount: z.number().min(0).default(0).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  usageLimit: z.number().int().min(0).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});

export const couponValidateSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code is too long')
    .transform((v) => v.toUpperCase().trim()),
  orderTotal: z
    .number()
    .min(0, 'Order total cannot be negative'),
});

export const reviewSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string().max(200, 'Title is too long').default('').optional(),
  comment: z
    .string()
    .min(1, 'Review comment is required')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .transform((v) => v.trim()),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters')
    .transform((v) => v.trim()),
  image: z.string().max(500).default('').optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .default('')
    .optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
