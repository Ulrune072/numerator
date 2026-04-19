// app/(student)/actions.ts
// Shared server actions for the student zone.
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** AUTH-06: Signs the user out and redirects to /login */
export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
