import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          addresses: user.addresses,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching profile.' },
      { status: 500 }
    );
  }
}
