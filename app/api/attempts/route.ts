// app/api/attempts/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitAnswer, getAttemptsByLecture } from '@/lib/services/progress';
import type { SubmitAttemptDTO } from '@/lib/types/database';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: SubmitAttemptDTO = await request.json();

  if (
    !body.task_id ||
    !body.lecture_id ||
    body.selected_index === undefined ||
    body.attempt_number === undefined
  ) {
    return NextResponse.json({ error: 'validation_error' }, { status: 400 });
  }

  try {
    const result = await submitAnswer(user.id, body);
    return NextResponse.json(result);
  } catch (e: any) {
    if (e.message?.includes('task_not_found')) {
      return NextResponse.json({ error: 'task_not_found' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lectureId = searchParams.get('lectureId');
  if (!lectureId) return NextResponse.json({ error: 'lectureId required' }, { status: 400 });

  const attempts = await getAttemptsByLecture(user.id, lectureId);
  return NextResponse.json(attempts);
}
