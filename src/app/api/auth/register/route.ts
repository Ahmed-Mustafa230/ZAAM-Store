import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { registerSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { rateLimitByIp } from '@/lib/rate-limit';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }

    await connectDB();
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return errorResponse('An account with this email already exists.', 409);
    }

    await User.create({
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
    });

    return successResponse(
      { message: 'Account created successfully.' },
      201
    );
  } catch (error) {
    return handleError(error, 'registration');
  }
}
