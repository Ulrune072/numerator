// app/api/lectures/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as lectureService from '@/lib/services/lectures';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { error: null };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const lecture = await lectureService.getLectureByIdAdmin(params.id);
  if (!lecture) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lecture);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  try {
    await lectureService.updateLecture(params.id, body);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'slug_taken') {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await lectureService.deleteLecture(params.id);
  return new NextResponse(null, { status: 204 });
}
