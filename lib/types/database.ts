// lib/types/database.ts
// Hand-written DB types matching 001_initial_schema.sql
// Replace with Supabase-generated types once stable:
//   supabase gen types typescript --project-id <id> > lib/types/database.ts

export type Role = 'student' | 'admin';

// ── Table row types ──────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  role: Role;
  total_score: number;
  created_at: string;
}

export interface Lecture {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_html: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  lecture_id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number; // NEVER expose in student-facing API responses
  score_value: number;
  order_index: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lecture_id: string;
  visited: boolean;
  completed: boolean;
  score_earned: number;
}

export interface TaskAttempt {
  id: string;
  user_id: string;
  task_id: string;
  lecture_id: string;
  selected_index: number;
  is_correct: boolean;
  attempt_number: number;
  attempted_at: string;
}

// ── API DTO types ────────────────────────────────────────────────────────────

/** Lecture list item sent to a student — includes their own progress flags */
export interface LectureListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  visited: boolean;
  completed: boolean;
}

/** Task returned to a student — correct_index is stripped */
export type StudentTaskDTO = Omit<Task, 'correct_index'>;

/** Task returned to an admin — full row */
export type TaskDTO = Task;

export interface CreateLectureDTO {
  slug: string;
  title: string;
  description?: string;
  content_html?: string;
  order_index: number;
  is_published: boolean;
}

export interface CreateTaskDTO {
  lecture_id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;
  score_value: number;
  order_index: number;
}

export interface SubmitAttemptDTO {
  task_id: string;
  lecture_id: string;
  selected_index: number;
  attempt_number: number;
}

export interface AttemptResultDTO {
  is_correct: boolean;
  score_awarded: number;
  total_score: number;
}

export interface AttemptSummary {
  task_id: string;
  selected_index: number;
  is_correct: boolean;
  attempt_number: number;
  attempted_at: string;
}

export interface AdminUserDTO {
  id: string;
  username: string;
  email: string;
  role: Role;
  total_score: number;
  completed_lectures_count: number;
}

// ── Scoring / status ─────────────────────────────────────────────────────────

export type Status =
  | 'Новичок'
  | 'Ученик'
  | 'Знаток'
  | 'Мастер'
  | 'Числитель ⭐';
