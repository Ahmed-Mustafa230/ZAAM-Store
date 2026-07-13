import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Please provide an email address.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user._id.toString(), user.role);

    return NextResponse.json(
      {
        message: 'Account created successfully.',
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
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}
