// app/(auth)/register/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface RegisterState {
  error: string | null;
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  // ── Basic validation ────────────────────────────────────────────────────
  if (!username || username.trim().length < 2) {
    return { error: 'Имя пользователя должно содержать минимум 2 символа.' };
  }
  if (!email || !email.includes('@')) {
    return { error: 'Введите корректный email.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Пароль должен содержать минимум 6 символов.' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The trigger handle_new_user() reads this to set profiles.username
      data: { username: username.trim() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Этот email уже зарегистрирован. Попробуйте войти.' };
    }
    return { error: error.message };
  }

  // Registration succeeded — Supabase sends a confirmation email.
  // Redirect to login with a success hint.
  redirect('/login?registered=1');
}
