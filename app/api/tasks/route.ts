// app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTasksForStudent, getTasksForAdmin, createTask } from '@/lib/services/tasks';
import type { CreateTaskDTO } from '@/lib/types/database';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lectureId = searchParams.get('lectureId');
  if (!lectureId) return NextResponse.json({ error: 'lectureId required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();

  if (profile?.role === 'admin') {
    const tasks = await getTasksForAdmin(lectureId);
    return NextResponse.json(tasks);
  }

  // correct_index is never selected in getTasksForStudent (TASK-03 security)
  const tasks = await getTasksForStudent(lectureId);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body: CreateTaskDTO = await request.json();
  if (!body.lecture_id || !body.question_text || !body.options || body.correct_index === undefined) {
    return NextResponse.json({ error: 'validation_error' }, { status: 400 });
  }

  try {
    const result = await createTask(body);
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
