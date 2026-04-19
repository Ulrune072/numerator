// app/(auth)/forgot-password/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export interface ForgotPasswordState {
  error: string | null;
  sent: boolean;
}

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get('email') as string;

  if (!email || !email.includes('@')) {
    return { error: 'Введите корректный email.', sent: false };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    // Don't reveal whether the email exists in the system
    console.error('resetPasswordForEmail error:', error.message);
  }

  // Always return success to prevent email enumeration
  return { error: null, sent: true };
}
