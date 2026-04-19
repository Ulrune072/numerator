// app/auth/callback/route.ts
// Handles the OAuth / magic-link PKCE code exchange.
// Supabase redirects the user here after email confirmation or password reset.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `next` is set by middleware when an unauthenticated user is redirected.
  const next = searchParams.get('next') ?? DEFAULT_AUTH_REDIRECT;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
