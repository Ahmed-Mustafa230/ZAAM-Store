import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
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

    return NextResponse.json(
      {
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { public_id } = await request.json();
    if (!public_id) {
      return NextResponse.json({ message: 'No public_id provided.' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ message: 'Image deleted successfully.' }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
