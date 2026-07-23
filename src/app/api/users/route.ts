import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { profileUpdateSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeString } from '@/lib/sanitize';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

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
    return handleError(error, 'fetching users');
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.phone !== undefined) updateData.phone = parsed.phone;
    if (parsed.addresses !== undefined) updateData.addresses = parsed.addresses;
    if (parsed.avatar !== undefined) updateData.avatar = parsed.avatar;

    if (parsed.currentPassword && parsed.newPassword) {
      const found = await User.findById(session.user.id).select('+password');
      if (!found) return errorResponse('User not found.', 404);
      const isValid = await bcrypt.compare(parsed.currentPassword, found.password);
      if (!isValid) return errorResponse('Current password is incorrect.', 400);
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(parsed.newPassword, salt);
    }

    const user = await User.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return errorResponse('User not found.', 404);
    }

    return successResponse({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return handleError(error, 'updating profile');
  }
}
