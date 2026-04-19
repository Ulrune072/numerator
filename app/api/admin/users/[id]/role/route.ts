// app/api/admin/users/[id]/role/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { changeRole } from '@/lib/services/users';
import type { Role } from '@/lib/types/database';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { error: null };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { role }: { role: Role } = await request.json();
  if (role !== 'student' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  await changeRole(params.id, role);
  return NextResponse.json({ ok: true });
}
