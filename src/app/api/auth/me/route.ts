import { auth } from '@/lib/auth.config';
import { connectDB } from '@/lib/db';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeString } from '@/lib/sanitize';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return errorResponse('User not found.', 404);
    }

    return successResponse({
      user: {
        id: user._id,
        name: sanitizeString(user.name),
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return handleError(error, 'fetching profile');
  }
}
