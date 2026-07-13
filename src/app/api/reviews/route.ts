import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching reviews.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const { product: productId, rating, title, comment } = body;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Please provide a rating between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { message: 'Please provide a review comment.' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    const existingReview = await Review.findOne({
      user: payload.userId,
      product: productId,
    });

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this product.' },
        { status: 409 }
      );
    }

    const purchasedOrder = await Order.findOne({
      user: payload.userId,
      'items.product': productId,
      status: { $in: ['delivered', 'shipped'] },
    });

    const isVerified = !!purchasedOrder;

    const review = await Review.create({
      user: payload.userId,
      product: productId,
      rating,
      title: title || '',
      comment: comment.trim(),
      isVerified,
    });

    const allReviews = await Review.find({ product: productId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = parseFloat((totalRating / allReviews.length).toFixed(1));

    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      numReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    return NextResponse.json(
      { message: 'Review created successfully.', review: populatedReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the review.' },
      { status: 500 }
    );
  }
}
