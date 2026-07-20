import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { reviewSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { rateLimitByUser } from '@/lib/rate-limit';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    if (!productId) {
      return errorResponse('Product ID is required.', 400);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      reviews,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    return handleError(error, 'fetching reviews');
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const { allowed } = rateLimitByUser(session.user.id, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many reviews. Please try again later.', 429);
    }

    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    const product = await Product.findById(parsed.product);
    if (!product) {
      return errorResponse('Product not found.', 404);
    }

    const existingReview = await Review.findOne({
      user: session.user.id,
      product: parsed.product,
    });

    if (existingReview) {
      return errorResponse('You have already reviewed this product.', 409);
    }

    const purchasedOrder = await Order.findOne({
      user: session.user.id,
      'items.product': parsed.product,
      status: { $in: ['delivered', 'shipped'] },
    });

    const isVerified = !!purchasedOrder;

    const review = await Review.create({
      user: session.user.id,
      product: parsed.product,
      rating: parsed.rating,
      title: parsed.title || '',
      comment: parsed.comment,
      isVerified,
    });

    const allReviews = await Review.find({ product: parsed.product });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = parseFloat((totalRating / allReviews.length).toFixed(1));

    await Product.findByIdAndUpdate(parsed.product, {
      rating: averageRating,
      numReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    return successResponse(
      { message: 'Review created successfully.', review: populatedReview },
      201
    );
  } catch (error) {
    return handleError(error, 'creating review');
  }
}
