// app/api/lectures/[id]/publish/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setPublished } from '@/lib/services/lectures';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { is_published }: { is_published: boolean } = await request.json();
  await setPublished(params.id, is_published);
  return NextResponse.json({ is_published });
}
