import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * Check if current user is an admin
 * For now, we'll use a simple email check until auth is fully set up
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // TODO: Replace with proper Supabase auth once implemented
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return false;
    
    // For now, check if admin user exists in database
    // In production, this should check the authenticated user's type
    const adminUser = await db.user.findFirst({
      where: {
        type: 'ADMIN',
        email: 'brad@eyre.co.za', // Your email as super admin
      },
    });

    return !!adminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin user or create if doesn't exist
 * This ensures you have admin access
 */
export async function getOrCreateAdmin(): Promise<{ id: string; email: string }> {
  let admin = await db.user.findFirst({
    where: {
      type: 'ADMIN',
      email: 'brad@eyre.co.za',
    },
  });

  if (!admin) {
    admin = await db.user.create({
      data: {
        email: 'brad@eyre.co.za',
        type: 'ADMIN',
        verified: true,
        verificationLevel: 'PREMIUM',
        firstName: 'Brad',
        lastName: 'Eyre',
      },
    });
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error('Unauthorized: Admin access required');
  }
  return await getOrCreateAdmin();
}

