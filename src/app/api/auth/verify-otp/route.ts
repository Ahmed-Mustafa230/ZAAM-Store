import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { signIn } from '@/lib/auth.config';
import { rateLimitByIp } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import User from '@/models/User';
import Otp from '@/models/Otp';

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
    const { email, otp, password } = body;

    if (!email || !email.trim()) {
      return errorResponse('Email is required.', 400);
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return errorResponse('Please enter a valid 6-digit verification code.', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return errorResponse('Password is required and must be at least 6 characters.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[VERIFY-OTP] Starting verification for:', normalizedEmail);

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      usedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log('[VERIFY-OTP] No OTP record found for:', normalizedEmail);
      return errorResponse(
        'No verification code found. Please request a new one.',
        404
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      console.log('[VERIFY-OTP] OTP expired for:', normalizedEmail);
      return errorResponse(
        'Verification code has expired. Please request a new one.',
        410
      );
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      console.log('[VERIFY-OTP] Max OTP attempts reached for:', normalizedEmail);
      return errorResponse(
        'Too many incorrect attempts. Please request a new verification code.',
        429
      );
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    if (otpRecord.otpHash !== otpHash) {
      await Otp.findByIdAndUpdate(otpRecord._id, {
        $inc: { attempts: 1 },
      });

      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      console.log('[VERIFY-OTP] Invalid OTP for:', normalizedEmail, '- attempts remaining:', remaining);
      if (remaining <= 0) {
        return errorResponse(
          'Too many incorrect attempts. Please request a new verification code.',
          429
        );
      }

      return errorResponse(
        `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        400
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('[VERIFY-OTP] User already exists:', normalizedEmail);
      await Otp.findByIdAndUpdate(otpRecord._id, { usedAt: new Date() });
      return errorResponse('An account with this email already exists.', 409);
    }

    console.log('[VERIFY-OTP] Creating user:', normalizedEmail, '- raw password length:', password.length);

    await User.create({
      name: otpRecord.name,
      email: normalizedEmail,
      password,
    });

    const createdUser = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('[VERIFY-OTP] User created:', !!createdUser, '- password field present:', !!createdUser?.password);

    await Otp.findByIdAndUpdate(otpRecord._id, { usedAt: new Date() });

    console.log('[VERIFY-OTP] Attempting signIn for:', normalizedEmail);
    const result = await signIn('credentials', {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    console.log('[VERIFY-OTP] signIn result:', JSON.stringify({ error: result?.error, status: result?.status }));

    if (result?.error) {
      console.log('[VERIFY-OTP] signIn returned error:', result.error);
      return successResponse(
        {
          message: 'Account created successfully. Please sign in.',
          verified: true,
        },
        201
      );
    }

    return successResponse(
      {
        message: 'Account created successfully.',
        verified: true,
        signedIn: true,
      },
      201
    );
  } catch (error) {
    console.error('[VERIFY-OTP] Unexpected error:', error);
    return handleError(error, 'verifying OTP');
  }
}
