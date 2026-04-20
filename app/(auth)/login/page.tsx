// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';

interface Props { searchParams: { registered?: string; error?: string; message?: string } }

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="auth-bg">
      <div className="register-grid" style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', boxShadow: '0 8px 40px rgba(26,26,46,0.12)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)' }}>

        {/* Left — branding panel */}
        <div className="register-left" style={{ background: 'var(--ink)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -80, right: -80, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -20, right: -20, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(232,153,58,0.08)', bottom: -60, left: -60, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <a href="/" style={{ fontFamily: 'Unbounded, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'block', marginBottom: '2.5rem' }}>
              Числ<span style={{ color: 'var(--accent)' }}>и</span>тель
            </a>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#fff', margin: '0 0 1rem', lineHeight: 1.25 }}>
              С возвращением!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
              Войдите, чтобы продолжить изучение числительных и следить за своим прогрессом.
            </p>
          </div>

          {/* Score tiers preview */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>Уровни</p>
            {[
              { label: 'Новичок',      range: '0 – 99',    color: 'rgba(255,255,255,0.3)' },
              { label: 'Ученик',       range: '100 – 299', color: '#85B7EB' },
              { label: 'Знаток',       range: '300 – 599', color: '#7F77DD' },
              { label: 'Мастер',       range: '600 – 999', color: 'var(--accent)' },
              { label: 'Числитель ⭐', range: '1000+',     color: '#EF9F27' },
            ].map((t) => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: t.color, fontWeight: 500 }}>{t.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{t.range}</span>
              </div>
            ))}
          </div>

          <p style={{ position: 'relative', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: '2rem 0 0', lineHeight: 1.5 }}>
            Ещё нет аккаунта?{' '}
            <a href="/register" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Зарегистрироваться</a>
          </p>
        </div>

        {/* Right — form panel */}
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', margin: '0 0 0.375rem', color: 'var(--ink)' }}>
              Войти в аккаунт
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', margin: 0 }}>
              Нет аккаунта?{' '}
              <a href="/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Создать</a>
            </p>
          </div>

          {searchParams.message === 'password_updated' && (
            <div className="success-msg" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> Пароль успешно обновлён — войдите с новым паролем.
            </div>
          )}
          {searchParams.registered && (
            <div className="success-msg" style={{ marginBottom: '1.25rem' }}>
              Аккаунт создан! Проверьте email для подтверждения.
            </div>
          )}
          {searchParams.error === 'auth_callback_failed' && (
            <div className="error-msg" style={{ marginBottom: '1.25rem' }}>
              Не удалось подтвердить сессию. Попробуйте ещё раз.
            </div>
          )}

          <LoginForm />

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <a href="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--ink-3)', textDecoration: 'none' }}>
              Забыли пароль?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}