import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import User from '@/models/User';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) return errorResponse('Authentication required.', 401);
    if (session.user.role !== 'admin') return errorResponse('Access denied. Admin privileges required.', 403);

    const { id } = await params;
    const body = await request.json();
    const { action, role } = body;

    if (!action) return errorResponse('Action is required.', 400);

    const validActions = ['block', 'unblock', 'restore', 'role', 'softDelete'];
    if (!validActions.includes(action)) return errorResponse('Invalid action.', 400);

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found.', 404);

    if (user.role === 'admin' && session.user.id !== user._id.toString()) {
      if (action !== 'role') {
        return errorResponse('Cannot perform this action on an admin.', 403);
      }
    }

    switch (action) {
      case 'block':
        if (user.isBlocked) return errorResponse('User is already blocked.', 400);
        user.isBlocked = true;
        await user.save();
        return successResponse({ message: 'User blocked successfully.', user });

      case 'unblock':
        if (!user.isBlocked) return errorResponse('User is not blocked.', 400);
        user.isBlocked = false;
        await user.save();
        return successResponse({ message: 'User unblocked successfully.', user });

      case 'restore':
        if (!user.isDeleted) return errorResponse('User is not deleted.', 400);
        user.isDeleted = false;
        user.deletedAt = null;
        await user.save();
        return successResponse({ message: 'User restored successfully.', user });

      case 'role':
        if (!role || !['customer', 'admin'].includes(role)) {
          return errorResponse('Valid role is required (customer or admin).', 400);
        }
        user.role = role;
        await user.save();
        return successResponse({ message: `User role changed to ${role}.`, user });

      case 'softDelete':
        if (user.isDeleted) return errorResponse('User is already deleted.', 400);
        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();
        return successResponse({ message: 'User soft deleted.', user });

      default:
        return errorResponse('Invalid action.', 400);
    }
  } catch (error) {
    return handleError(error, 'updating user');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) return errorResponse('Authentication required.', 401);
    if (session.user.role !== 'admin') return errorResponse('Access denied. Admin privileges required.', 403);

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found.', 404);

    if (user.role === 'admin') {
      return errorResponse('Cannot delete an admin user.', 403);
    }

    if (permanent) {
      await User.findByIdAndDelete(id);
      return successResponse({ message: 'User permanently deleted.' });
    }

    if (user.isDeleted) return errorResponse('User is already deleted.', 400);
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    return successResponse({ message: 'User soft deleted.' });
  } catch (error) {
    return handleError(error, 'deleting user');
  }
}
