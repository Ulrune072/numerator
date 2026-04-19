// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // SUPABASE_SERVICE_ROLE_KEY is intentionally NOT forwarded here.
  // It is only read in lib/supabase/admin.ts at runtime on the server.

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://docs.google.com",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://api.supabase.io`,
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
