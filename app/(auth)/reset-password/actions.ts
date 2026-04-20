// app/(auth)/reset-password/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface ResetPasswordState {
  error: string | null;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!password || password.length < 8) {
    return { error: 'Пароль должен содержать не менее 8 символов.' };
  }

  if (password !== confirm) {
    return { error: 'Пароли не совпадают.' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('updateUser error:', error.message);
    // Most common case: the reset link has expired or already been used
    return { error: 'Не удалось обновить пароль. Ссылка могла устареть — запросите новую.' };
  }

  // Password updated — send the user to login
  redirect('/login?message=password_updated');
}