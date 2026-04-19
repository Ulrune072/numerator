// app/page.tsx
import { redirect } from 'next/navigation';

// The middleware will catch unauthenticated users and send them to /login.
// Authenticated users landing on / are forwarded to /dashboard.
export default function RootPage() {
  redirect('/dashboard');
}
