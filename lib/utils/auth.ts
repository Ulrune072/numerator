// lib/utils/auth.ts
// Server-side auth helpers used in Server Components and Route Handlers.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

/** Returns the current session, or null if not authenticated. */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Returns the current session.
 * Redirects to /login if there is no active session.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/**
 * Returns the current session AND the user's profile.
 * Redirects to /login if not authenticated.
 * Redirects to /dashboard if the user's role is not 'admin'.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single<Profile>();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return { session, profile };
}

/**
 * Fetches the current user's profile row.
 * Returns null if the user is not authenticated or has no profile.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  return data ?? null;
}
