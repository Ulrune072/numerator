// app/api/admin/users/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteUser } from '@/lib/services/users';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { error: null };
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await deleteUser(params.id);
  return new NextResponse(null, { status: 204 });
}
