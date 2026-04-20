'use client';
import { useFormState } from 'react-dom';
import { forgotPasswordAction, type ForgotPasswordState } from '@/app/(auth)/forgot-password/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: ForgotPasswordState = { error: null, sent: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useFormState(forgotPasswordAction, initialState);

  if (state.sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Success state */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '2rem 1.5rem', textAlign: 'center',
          background: 'var(--success-bg)',
          border: '1.5px solid rgba(45,122,79,0.2)',
          borderRadius: 'var(--radius-lg)', gap: '0.75rem',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--success)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.375rem', color: '#fff',
          }}>
            ✓
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--success)', margin: '0 0 0.25rem' }}>
              Письмо отправлено!
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
              Проверьте входящие и папку «Спам». Ссылка действует 1 час.
            </p>
          </div>
        </div>

        <a href="/login" className="btn btn-outline" style={{ textAlign: 'center' }}>
          ← Вернуться ко входу
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email" name="email" type="email"
          autoComplete="email" required
          className="field-input"
          placeholder="you@example.com"
        />
      </div>

      {state.error && <ErrorMessage message={state.error} />}

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending
          ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Отправка…
            </span>
          : 'Отправить ссылку →'
        }
      </button>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        Письмо придёт в течение нескольких минут
      </p>
    </form>
  );
}