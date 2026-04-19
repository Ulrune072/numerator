// middleware.ts
// Runs on every request (except static assets, see `config.matcher`).
// Responsibilities:
//  1. Refresh the Supabase session cookie (standard @supabase/ssr pattern).
//  2. Redirect unauthenticated users to /login  (AUTH-01)
//  3. Redirect non-admin users away from /admin routes  (AUTH-07)

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTE_PREFIX,
  DEFAULT_AUTH_REDIRECT,
  LOGIN_REDIRECT,
} from '@/lib/constants';

export async function middleware(request: NextRequest) {
  // ── 1. Bootstrap a response so we can forward Set-Cookie headers ──────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies both on the request (so later handlers see them)
          // and on the response (so the browser receives them).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not add logic between createServerClient and getUser()
  // that could invalidate the session-refresh flow.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── 2. Public routes — always allow through ───────────────────────────────
  const isPublic = (PUBLIC_ROUTES as readonly string[]).includes(pathname);
  if (isPublic) return supabaseResponse;

  // ── 3. No session → redirect to /login ───────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_REDIRECT;
    // Preserve the intended destination so we can redirect back after login.
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Admin routes — check role ─────────────────────────────────────────
  if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = DEFAULT_AUTH_REDIRECT;
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico, sitemap.xml, robots.txt
     *  - Public asset files (svg, png, jpg, …)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
