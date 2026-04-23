// lib/services/lectures.ts

import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import type {
  Lecture,
  LectureListItem,
  CreateLectureDTO,
} from '@/lib/types/database';

// ── Student ──────────────────────────────────────────────────────────────────

export async function getPublishedLectures(userId: string, userScore: number = 0): Promise<LectureListItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('lectures')
    .select(`
      id, slug, title, description, order_index, is_published, min_score,
      user_progress!left ( visited, completed )
    `)
    .eq('is_published', true)
    .order('order_index');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => {
    const progress = Array.isArray(row.user_progress)
      ? row.user_progress.find((p: any) => p !== null) ?? null
      : row.user_progress ?? null;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      order_index: row.order_index,
      is_published: row.is_published,
      min_score: row.min_score ?? 0,
      locked: (row.min_score ?? 0) > userScore,
      visited: progress?.visited ?? false,
      completed: progress?.completed ?? false,
    };
  });
}

export async function getLectureBySlug(slug: string): Promise<Lecture | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single<Lecture>();

  if (error) return null;
  return data;
}

/** Returns true if user's score is below the lecture's min_score requirement. */
export function isLocked(lecture: Lecture, userScore: number): boolean {
  return (lecture.min_score ?? 0) > userScore;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllLectures(): Promise<Lecture[]> {
  const { data, error } = await adminClient
    .from('lectures')
    .select('*')
    .order('order_index');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLectureByIdAdmin(id: string): Promise<Lecture | null> {
  const { data, error } = await adminClient
    .from('lectures')
    .select('*')
    .eq('id', id)
    .single<Lecture>();

  if (error) return null;
  return data;
}

export async function createLecture(dto: CreateLectureDTO): Promise<{ id: string }> {
  const { data, error } = await adminClient
    .from('lectures')
    .insert(dto)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === '23505') throw new Error('slug_taken');
    throw new Error(error.message);
  }
  return data!;
}

export async function updateLecture(
  id: string,
  dto: Partial<CreateLectureDTO>,
): Promise<void> {
  const { error } = await adminClient
    .from('lectures')
    .update(dto)
    .eq('id', id);

  if (error) {
    if (error.code === '23505') throw new Error('slug_taken');
    throw new Error(error.message);
  }
}

export async function deleteLecture(id: string): Promise<void> {
  const { error } = await adminClient.from('lectures').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setPublished(id: string, value: boolean): Promise<void> {
  const { error } = await adminClient
    .from('lectures')
    .update({ is_published: value })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
