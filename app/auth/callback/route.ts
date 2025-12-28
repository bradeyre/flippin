import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { UserType } from '@prisma/client';
import { redirect } from 'next/navigation';

/**
 * GET /auth/callback
 * Handle Supabase auth callback and create user if needed
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      // Check if user exists in our database
      const existingUser = await db.user.findUnique({
        where: { id: data.user.id },
      });

      if (!existingUser) {
        // Create new user
        const userMetadata = data.user.user_metadata || {};
        await db.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            firstName: userMetadata.firstName || null,
            lastName: userMetadata.lastName || null,
            type: UserType.PERSONAL_SELLER,
            verified: false,
            verificationLevel: 'BASIC',
          },
        });
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
}

