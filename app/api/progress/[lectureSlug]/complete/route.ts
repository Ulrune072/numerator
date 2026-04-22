// app/api/progress/[lectureSlug]/complete/route.ts
// Called by TasksRunner when all questions are answered.
// Marks user_progress.completed = true and sets final score_earned.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markCompleted } from '@/lib/services/progress';

export async function POST(
  request: Request,
  { params }: { params: { lectureSlug: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lectureId, scoreEarned }: { lectureId: string; scoreEarned: number } =
    await request.json();

  await markCompleted(user.id, lectureId, scoreEarned);
  return NextResponse.json({ ok: true });
}