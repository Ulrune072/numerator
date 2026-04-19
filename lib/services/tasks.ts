// lib/services/tasks.ts

import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import type { StudentTaskDTO, TaskDTO, CreateTaskDTO } from '@/lib/types/database';

export async function getTasksForStudent(lectureId: string): Promise<StudentTaskDTO[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('id, lecture_id, question_text, options, score_value, order_index')
    .eq('lecture_id', lectureId)
    .order('order_index');

  if (error) throw new Error(error.message);
  return (data ?? []) as StudentTaskDTO[];
}

export async function getTasksForAdmin(lectureId: string): Promise<TaskDTO[]> {
  const { data, error } = await adminClient
    .from('tasks')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('order_index');

  if (error) throw new Error(error.message);
  return (data ?? []) as TaskDTO[];
}

export async function createTask(dto: CreateTaskDTO): Promise<{ id: string }> {
  const { data, error } = await adminClient
    .from('tasks')
    .insert(dto)
    .select('id')
    .single<{ id: string }>();

  if (error) throw new Error(error.message);
  return data!;
}

export async function updateTask(
  id: string,
  dto: Partial<CreateTaskDTO>,
): Promise<void> {
  const { error } = await adminClient.from('tasks').update(dto).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await adminClient.from('tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
