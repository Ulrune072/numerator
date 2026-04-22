// lib/services/progress.ts

import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import type { AttemptResultDTO, AttemptSummary, SubmitAttemptDTO } from '@/lib/types/database';

export async function recordVisit(userId: string, lectureSlug: string): Promise<void> {
  const supabase = createClient();

  const { data: lecture } = await supabase
    .from('lectures')
    .select('id')
    .eq('slug', lectureSlug)
    .eq('is_published', true)
    .single<{ id: string }>();

  if (!lecture) return;

  await supabase
    .from('user_progress')
    .upsert(
      { user_id: userId, lecture_id: lecture.id, visited: true },
      { onConflict: 'user_id,lecture_id', ignoreDuplicates: false },
    );
}

export async function hasVisited(userId: string, lectureSlug: string): Promise<boolean> {
  const supabase = createClient();

  const { data: lecture } = await supabase
    .from('lectures')
    .select('id')
    .eq('slug', lectureSlug)
    .eq('is_published', true)
    .single<{ id: string }>();

  if (!lecture) return false;

  const { data } = await supabase
    .from('user_progress')
    .select('visited')
    .eq('user_id', userId)
    .eq('lecture_id', lecture.id)
    .single<{ visited: boolean }>();

  return data?.visited ?? false;
}

export async function submitAnswer(
  userId: string,
  dto: SubmitAttemptDTO,
): Promise<AttemptResultDTO> {
  // Uses the atomic DB function — correctness check + scoring in one call
  const supabase = createClient();

  const { data, error } = await supabase.rpc('submit_attempt', {
    p_user_id: userId,
    p_task_id: dto.task_id,
    p_lecture_id: dto.lecture_id,
    p_selected: dto.selected_index,
    p_attempt_num: dto.attempt_number,
  });

  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    is_correct: row.is_correct,
    score_awarded: row.score_awarded,
    total_score: row.total_score,
  };
}

export async function getAttemptsByLecture(
  userId: string,
  lectureId: string,
): Promise<AttemptSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('task_attempts')
    .select('task_id, selected_index, is_correct, attempt_number, attempted_at')
    .eq('user_id', userId)
    .eq('lecture_id', lectureId)
    .order('attempted_at');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function hasAttempted(userId: string, lectureId: string): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from('task_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('lecture_id', lectureId);
  return (count ?? 0) > 0;
}

export async function getBestResult(
  userId: string,
  lectureId: string,
): Promise<{ correct: number; total: number }> {
  const supabase = createClient();

  // Count distinct tasks in the lecture
  const { count: total } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('lecture_id', lectureId);

  // Count first-attempt correct answers
  const { data } = await supabase
    .from('task_attempts')
    .select('task_id, is_correct')
    .eq('user_id', userId)
    .eq('lecture_id', lectureId)
    .eq('attempt_number', 1)
    .eq('is_correct', true);

  return { correct: data?.length ?? 0, total: total ?? 0 };
}

export async function markCompleted(
  userId: string,
  lectureId: string,
  scoreEarned: number,
): Promise<void> {
  const supabase = createClient();

  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lecture_id: lectureId,
      visited: true,
      completed: true,
      score_earned: scoreEarned,
    },
    { onConflict: 'user_id,lecture_id' },
  );
}