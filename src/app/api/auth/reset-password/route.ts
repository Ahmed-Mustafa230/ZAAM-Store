import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return errorResponse('Email is required.', 400);
    }

    if (!password || typeof password !== 'string') {
      return errorResponse('Password is required.', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return errorResponse('Invalid or expired reset session.', 400);
    }

    if (user.isDeleted) {
      return errorResponse('Invalid or expired reset session.', 400);
    }

    if (!user.resetOtpVerified) {
      return errorResponse('Invalid or expired reset session.', 400);
    }

    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpVerified = false;
    await user.save();

    return successResponse({
      message: 'Password has been updated successfully. Please sign in with your new password.',
    });
  } catch (error) {
    return handleError(error, 'resetting password');
  }
}
