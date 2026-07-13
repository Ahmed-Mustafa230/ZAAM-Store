import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Please provide your email address.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'Please provide your password.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = generateToken(user._id.toString(), user.role);

    return NextResponse.json(
      {
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
