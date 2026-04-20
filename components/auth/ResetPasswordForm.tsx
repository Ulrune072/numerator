'use client';
// components/auth/ResetPasswordForm.tsx

import { useFormState } from 'react-dom';
import { resetPasswordAction, type ResetPasswordState } from '@/app/(auth)/reset-password/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: ResetPasswordState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useFormState(resetPasswordAction, initialState);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label htmlFor="password" className="field-label">Новый пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field-input"
          placeholder="Минимум 8 символов"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="field-label">Повторите пароль</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field-input"
          placeholder="Повторите новый пароль"
        />
      </div>

      {state.error && <ErrorMessage message={state.error} />}

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            Сохранение…
          </span>
        ) : (
          'Сохранить новый пароль →'
        )}
      </button>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        После сохранения вы будете перенаправлены на страницу входа
      </p>
    </form>
  );
}