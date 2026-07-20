import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sendOtpEmail } from '@/lib/email';
import User from '@/models/User';
import Otp from '@/models/Otp';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 3,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many requests. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return errorResponse('An account with this email already exists.', 409);
    }

    const existingOtp = await Otp.findOne({
      email: parsed.email,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (existingOtp) {
      return errorResponse(
        'A verification code has already been sent. Please check your email or wait for it to expire before requesting a new one.',
        429
      );
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const passwordHash = await hashPassword(parsed.password);
    console.log('[SEND-OTP] Password hash created for:', parsed.email, '- length:', passwordHash.length);

    await Otp.create({
      email: parsed.email,
      otpHash,
      name: parsed.name,
      passwordHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
    });

    try {
      await sendOtpEmail(parsed.email, otp, parsed.name);
    } catch {
      return errorResponse(
        'Failed to send verification email. Please check your email address and try again.',
        500
      );
    }

    return successResponse(
      {
        message: 'Verification code sent to your email.',
        email: parsed.email,
      },
      200
    );
  } catch (error) {
    return handleError(error, 'sending OTP');
  }
}
