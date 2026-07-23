import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 10,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const { email, otp } = body;

    if (!email || !email.trim()) {
      return errorResponse('Email is required.', 400);
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return errorResponse('Please enter a valid 6-digit verification code.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return errorResponse('Invalid or expired verification code.', 400);
    }

    if (user.isDeleted) {
      return errorResponse('Invalid or expired verification code.', 400);
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return errorResponse('No verification code found. Please request a new one.', 400);
    }

    if (user.resetOtpExpiry < new Date()) {
      return errorResponse('Verification code has expired. Please request a new one.', 410);
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.resetOtp !== otpHash) {
      return errorResponse('Invalid verification code. Please check and try again.', 400);
    }

    user.resetOtpVerified = true;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return successResponse({
      message: 'Verification successful.',
      verified: true,
    });
  } catch (error) {
    return handleError(error, 'verifying reset OTP');
  }
}
