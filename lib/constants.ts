// lib/constants.ts

export const APP_NAME = 'Числитель';

/** Public routes that do not require authentication */
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/auth/callback',
] as const;

/** Routes restricted to users with role = 'admin' */
export const ADMIN_ROUTE_PREFIX = '/admin';

/** Default redirect after successful login */
export const DEFAULT_AUTH_REDIRECT = '/dashboard';

/** Default redirect when an unauthenticated user hits a protected route */
export const LOGIN_REDIRECT = '/login';
