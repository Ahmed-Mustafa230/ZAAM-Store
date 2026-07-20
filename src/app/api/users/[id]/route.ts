import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('User ID is required.', 400);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse('User not found.', 404);
    }

    return successResponse({ user });
  } catch (error) {
    return handleError(error, 'fetching user');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('User ID is required.', 400);
    }

    if (id === session.user.id) {
      return errorResponse('You cannot delete your own account.', 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return errorResponse('User not found.', 404);
    }

    return successResponse({ message: 'User deleted successfully.' });
  } catch (error) {
    return handleError(error, 'deleting user');
  }
}
