import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/auth/signup
 * Send magic link for signup
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Check if user already exists, if not we'll create them on first login
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // User will be created on first login via callback
      // Send welcome email
      try {
        await sendEmail(
          email,
          emailTemplates.welcome(firstName || 'there')
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      message: 'Signup link sent to your email',
    });
  } catch (error) {
    console.error('Error sending signup link:', error);
    return NextResponse.json(
      {
        error: 'Failed to send signup link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

