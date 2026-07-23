import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sendResetOtpEmail } from '@/lib/email';
import User from '@/models/User';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 3,
      windowMs: 120_000,
    });
    if (!allowed) {
      return errorResponse('Too many requests. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return errorResponse('Email is required.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return successResponse({
        message: 'If an account exists with this email, a verification code has been sent.',
      });
    }

    if (user.isDeleted) {
      return successResponse({
        message: 'If an account exists with this email, a verification code has been sent.',
      });
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetOtp = otpHash;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpVerified = false;
    await user.save();

    try {
      await sendResetOtpEmail(normalizedEmail, otp, user.name);
    } catch {
      return errorResponse('Failed to send verification email. Please try again.', 500);
    }

    return successResponse({
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    return handleError(error, 'resending reset OTP');
  }
}
