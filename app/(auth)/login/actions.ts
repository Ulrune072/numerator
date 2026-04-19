// app/(auth)/login/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants';

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Введите email и пароль.' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // AUTH-03: surface a friendly error, not a raw Supabase message
    return { error: 'Неверный email или пароль.' };
  }

  // Read the `next` param that middleware may have set before redirecting here
  const headersList = headers();
  const referer = headersList.get('referer') ?? '';
  const nextParam = new URL(referer, 'http://localhost').searchParams.get('next');
  const destination =
    nextParam && nextParam.startsWith('/') ? nextParam : DEFAULT_AUTH_REDIRECT;

  redirect(destination);
}
