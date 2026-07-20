import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sendPasswordResetEmail } from '@/lib/email';
import User from '@/models/User';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) return errorResponse('Authentication required.', 401);
    if (session.user.role !== 'admin') return errorResponse('Access denied. Admin privileges required.', 403);

    const { id } = await params;

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found.', 404);

    if (user.isDeleted) return errorResponse('Cannot send reset email to a deleted user.', 400);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.set('resetTokenHash', resetTokenHash);
    user.set('resetTokenExpiry', resetTokenExpiry);

    const result = await User.findByIdAndUpdate(id, {
      resetTokenHash,
      resetTokenExpiry,
    });

    if (!result) return errorResponse('Failed to set reset token.', 500);

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch {
      return errorResponse('Failed to send reset email. Check email configuration.', 500);
    }

    return successResponse({ message: `Password reset email sent to ${user.email}.` });
  } catch (error) {
    return handleError(error, 'sending password reset email');
  }
}
