// app/(auth)/reset-password/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default async function ResetPasswordPage() {
  // Guard: if there's no active session (i.e. the PKCE exchange hasn't happened),
  // the user probably landed here directly — send them back to forgot-password.
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/forgot-password');

  return (
    <div className="auth-bg">
      <div
        className="register-grid"
        style={{
          width: '100%', maxWidth: '900px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0', boxShadow: '0 8px 40px rgba(26,26,46,0.12)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          background: 'var(--surface)',
        }}
      >
        {/* Left — branding panel */}
        <div
          className="register-left"
          style={{
            background: 'var(--ink)', padding: '3rem',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* decorative rings */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -80, right: -80, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -20, right: -20, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(232,153,58,0.08)', bottom: -60, left: -60, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <a
              href="/"
              style={{ fontFamily: 'Unbounded, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'block', marginBottom: '2.5rem' }}
            >
              Числ<span style={{ color: 'var(--accent)' }}>и</span>тель
            </a>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#fff', margin: '0 0 1rem', lineHeight: 1.25 }}>
              Новый пароль
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
              Придумайте надёжный пароль — и снова в путь.
            </p>
          </div>

          {/* Tips */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>Советы по паролю</p>
            {[
              { n: '✓', text: 'Не менее 8 символов' },
              { n: '✓', text: 'Буквы, цифры и спецсимволы' },
              { n: '✓', text: 'Не используйте старый пароль' },
            ].map((s) => (
              <div key={s.n + s.text} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,153,58,0.15)', border: '1px solid rgba(232,153,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                  {s.n}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>{s.text}</span>
              </div>
            ))}
          </div>

          <p style={{ position: 'relative', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: '2rem 0 0', lineHeight: 1.5 }}>
            Вспомнили пароль?{' '}
            <a href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Войти</a>
          </p>
        </div>

        {/* Right — form panel */}
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', margin: '0 0 0.375rem', color: 'var(--ink)' }}>
              Придумайте пароль
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', margin: 0 }}>
              Введите и подтвердите новый пароль для вашего аккаунта
            </p>
          </div>

          <ResetPasswordForm />

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <a href="/login" style={{ fontSize: '0.875rem', color: 'var(--ink-3)', textDecoration: 'none' }}>
              ← Вернуться ко входу
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}