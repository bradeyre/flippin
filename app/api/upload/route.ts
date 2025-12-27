import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
  forcePathStyle: true,
  tls: true,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const key = `listings/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);

    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for missing environment variables
    const missingVars: string[] = [];
    if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) missingVars.push('CLOUDFLARE_R2_ACCOUNT_ID');
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY) missingVars.push('CLOUDFLARE_R2_ACCESS_KEY');
    if (!process.env.CLOUDFLARE_R2_SECRET_KEY) missingVars.push('CLOUDFLARE_R2_SECRET_KEY');
    if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) missingVars.push('CLOUDFLARE_R2_BUCKET_NAME');
    if (!process.env.NEXT_PUBLIC_R2_PUBLIC_URL) missingVars.push('NEXT_PUBLIC_R2_PUBLIC_URL');
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          error: 'Image storage not configured',
          details: `Missing environment variables: ${missingVars.join(', ')}`,
          hint: 'Please configure Cloudflare R2 credentials in your .env file'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: errorMessage,
        hint: 'Check Cloudflare R2 credentials and bucket configuration'
      },
      { status: 500 }
    );
  }
}
