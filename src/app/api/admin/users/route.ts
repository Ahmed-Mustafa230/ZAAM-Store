import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeString } from '@/lib/sanitize';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) return errorResponse('Authentication required.', 401);
    if (session.user.role !== 'admin') return errorResponse('Access denied. Admin privileges required.', 403);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search');
    const showDeleted = searchParams.get('showDeleted') === 'true';

    const query: Record<string, unknown> = {};

    if (!showDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (search) {
      const sanitized = sanitizeString(search);
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      users,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    return handleError(error, 'fetching admin users');
  }
}
