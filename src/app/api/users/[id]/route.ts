import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const adminError = adminOnly(payload);
    if (adminError) {
      return adminError;
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'User ID is required.' },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching the user.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const adminError = adminOnly(payload);
    if (adminError) {
      return adminError;
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'User ID is required.' },
        { status: 400 }
      );
    }

    if (id === payload.userId) {
      return NextResponse.json(
        { message: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while deleting the user.' },
      { status: 500 }
    );
  }
}
