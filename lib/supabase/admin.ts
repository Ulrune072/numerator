// lib/supabase/admin.ts
// Service-role Supabase client — bypasses Row Level Security.
// SERVER-ONLY. Never import this from a Client Component or expose to the browser.
// SUPABASE_SERVICE_ROLE_KEY must NOT be prefixed with NEXT_PUBLIC_.

import { createClient } from '@supabase/supabase-js';

// Fail fast at startup if the key is missing, rather than silently at runtime.
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (server-only, never NEXT_PUBLIC_).',
  );
}

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // Prevents the service-role client from storing a session in the browser.
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
