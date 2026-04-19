// lib/supabase/server.ts
// Server-side Supabase client — use in Server Components, Route Handlers,
// and Server Actions. Reads / writes cookies for session management.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // Cookies can only be set from Route Handlers or Server Actions.
            // The middleware refreshes the session cookie, so this is safe to ignore.
          }
        },
      },
    },
  );
}
