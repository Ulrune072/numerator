// app/auth/callback/route.ts
// Handles the OAuth / magic-link PKCE code exchange.
// Supabase redirects the user here after email confirmation or password reset.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? DEFAULT_AUTH_REDIRECT;

  // Use forwarded host from reverse proxy (Render), fallback to origin
  const host = request.headers.get('x-forwarded-host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const siteOrigin = host ? `${proto}://${host}` : origin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${siteOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${siteOrigin}/login?error=auth_callback_failed`);
}
