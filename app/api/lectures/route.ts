// app/api/lectures/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as lectureService from '@/lib/services/lectures';
import type { CreateLectureDTO } from '@/lib/types/database';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profile?.role === 'admin') {
    const lectures = await lectureService.getAllLectures();
    return NextResponse.json(lectures);
  }

  const lectures = await lectureService.getPublishedLectures(user.id);
  return NextResponse.json(lectures);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: CreateLectureDTO = await request.json();
  if (!body.slug || !body.title || body.order_index === undefined) {
    return NextResponse.json({ error: 'validation_error', message: 'slug, title, order_index required' }, { status: 400 });
  }

  try {
    const result = await lectureService.createLecture(body);
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e.message === 'slug_taken') {
      return NextResponse.json({ error: 'slug_taken', message: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
