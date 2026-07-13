import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import User from '@/models/User';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching users.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const { name, phone, addresses, avatar } = body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (addresses !== undefined) {
      updateData.addresses = addresses;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(payload.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          addresses: user.addresses,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating profile.' },
      { status: 500 }
    );
  }
}
