// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listAll } from '@/lib/services/users';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { user, error: null };
}

export { requireAdmin };

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await listAll();
  return NextResponse.json(users);
}
