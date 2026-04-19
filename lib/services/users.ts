// lib/services/users.ts
// All methods use the service-role client — server-only.

import { adminClient } from '@/lib/supabase/admin';
import type { AdminUserDTO, Role } from '@/lib/types/database';

export async function listAll(): Promise<AdminUserDTO[]> {
  // Fetch profiles + completed lecture count
  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select(`
      id, username, role, total_score,
      user_progress ( completed )
    `)
    .order('total_score', { ascending: false });

  if (error) throw new Error(error.message);

  // Fetch emails from auth.users via admin API
  const { data: authList, error: authError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (authError) throw new Error(authError.message);

  const emailMap = new Map(authList.users.map((u) => [u.id, u.email ?? '']));

  return (profiles ?? []).map((p: any) => ({
    id: p.id,
    username: p.username,
    email: emailMap.get(p.id) ?? '',
    role: p.role as Role,
    total_score: p.total_score,
    completed_lectures_count: (p.user_progress as { completed: boolean }[]).filter(
      (up) => up.completed,
    ).length,
  }));
}

export async function changeRole(userId: string, role: Role): Promise<void> {
  const { error } = await adminClient
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function resetProgress(userId: string): Promise<void> {
  // Delete attempts and progress — cascade handles child rows
  await adminClient.from('task_attempts').delete().eq('user_id', userId);
  await adminClient.from('user_progress').delete().eq('user_id', userId);
  await adminClient.from('profiles').update({ total_score: 0 }).eq('id', userId);
}

export async function deleteUser(userId: string): Promise<void> {
  // Deletes auth user — CASCADE removes profiles → user_progress → task_attempts
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}
