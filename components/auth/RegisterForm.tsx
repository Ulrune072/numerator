'use client';
import { useFormState } from 'react-dom';
import { useState } from 'react';
import { registerAction, type RegisterState } from '@/app/(auth)/register/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: RegisterState = { error: null };

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3;
  const labels = ['', 'Слабый', 'Хороший', 'Надёжный'];
  const colors = ['', 'var(--danger)', 'var(--accent)', 'var(--success)'];

  if (len === 0) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
        {[1, 2, 3].map((lvl) => (
          <div key={lvl} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: strength >= lvl ? colors[strength] : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: colors[strength], margin: 0, fontWeight: 500 }}>
        {labels[strength]}
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useFormState(registerAction, initialState);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

      <div>
        <label htmlFor="username" className="field-label">Имя пользователя</label>
        <input
          id="username" name="username" type="text"
          autoComplete="username" required minLength={2}
          className="field-input" placeholder="Иван"
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', margin: '0.3rem 0 0' }}>
          Отображается в личном кабинете
        </p>
      </div>

      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email" name="email" type="email"
          autoComplete="email" required
          className="field-input" placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">Пароль</label>
        <div style={{ position: 'relative' }}>
          <input
            id="password" name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password" required minLength={6}
            className="field-input"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{
              position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-3)', fontSize: '0.875rem', padding: '0.25rem',
              fontFamily: 'Golos Text, sans-serif',
            }}
            tabIndex={-1}
          >
            {showPass ? 'Скрыть' : 'Показать'}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      {state.error && <ErrorMessage message={state.error} />}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        {isPending ? 'Создание аккаунта…' : 'Создать аккаунт →'}
      </button>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        Регистрируясь, вы соглашаетесь с правилами использования сервиса
      </p>
    </form>
  );
}