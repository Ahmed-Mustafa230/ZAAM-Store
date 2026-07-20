import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { rateLimitByUser } from '@/lib/rate-limit';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { allowed } = rateLimitByUser(session.user.id, {
      maxRequests: 20,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many uploads. Please try again later.', 429);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return errorResponse('No file provided.', 400);
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.', 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('File too large. Maximum size is 10MB.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    interface CloudinaryResult {
      public_id: string;
      url: string;
      secure_url: string;
    }

    const result = await new Promise<CloudinaryResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'zaam-store/products',
          upload_preset: 'zaamstore',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res as CloudinaryResult);
        }
      );
      uploadStream.end(buffer);
    });

    return successResponse({
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
    });
  } catch (error) {
    return handleError(error, 'uploading image');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { public_id } = await request.json();
    if (!public_id) {
      return errorResponse('No public_id provided.', 400);
    }

    await cloudinary.uploader.destroy(public_id);

    return successResponse({ message: 'Image deleted successfully.' });
  } catch (error) {
    return handleError(error, 'deleting image');
  }
}
