import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sendOtpResendNotification } from '@/lib/email';
import Otp from '@/models/Otp';

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

    const lastOtp = await Otp.findOne({
      email: normalizedEmail,
      usedAt: null,
    }).sort({ createdAt: -1 });

    if (!lastOtp) {
      return errorResponse(
        'No previous verification found. Please start registration again.',
        404
      );
    }

    if (lastOtp.attempts >= lastOtp.maxAttempts) {
      await Otp.findByIdAndUpdate(lastOtp._id, { usedAt: new Date() });
      return errorResponse(
        'Maximum attempts reached. Please start registration again.',
        429
      );
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      name: lastOtp.name,
      passwordHash: lastOtp.passwordHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
    });

    try {
      await sendOtpResendNotification(normalizedEmail, otp, lastOtp.name);
    } catch {
      return errorResponse(
        'Failed to send verification email. Please try again.',
        500
      );
    }

    return successResponse(
      {
        message: 'New verification code sent to your email.',
        email: normalizedEmail,
      },
      200
    );
  } catch (error) {
    return handleError(error, 'resending OTP');
  }
}
