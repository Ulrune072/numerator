'use client';
import { useFormState } from 'react-dom';
import { loginAction, type LoginState } from '@/app/(auth)/login/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useFormState(loginAction, initialState);
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field-input" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Пароль</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" placeholder="••••••••" />
      </div>
      {state.error && <ErrorMessage message={state.error} />}
      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.25rem' }}>
        {isPending ? 'Вход…' : 'Войти'}
      </button>
    </form>
  );
}
