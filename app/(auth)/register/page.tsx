// app/(auth)/register/page.tsx
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="auth-bg">
      <div className="register-grid" style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', boxShadow: '0 8px 40px rgba(26,26,46,0.12)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)' }}>

        {/* Left — branding panel */}
        <div className="register-left" style={{ background: 'var(--ink)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -80, right: -80, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -20, right: -20, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(232,153,58,0.08)', bottom: -60, left: -60, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <a href="/" style={{ fontFamily: 'Unbounded, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'block', marginBottom: '2.5rem' }}>
              Числ<span style={{ color: 'var(--accent)' }}>и</span>тель
            </a>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#fff', margin: '0 0 1rem', lineHeight: 1.25 }}>
              Начни изучать числительные
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
              Лекции, задания и личный прогресс — всё в одном месте.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '2.5rem' }}>
            {[
              { icon: '◧', text: 'Структурированные лекции' },
              { icon: '✎', text: 'Интерактивные задания' },
              { icon: '◉', text: 'Личный кабинет с прогрессом' },
              { icon: '⭐', text: 'Система уровней и баллов' },
            ].map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(232,153,58,0.15)', border: '1px solid rgba(232,153,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--accent)', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p style={{ position: 'relative', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: '2rem 0 0', lineHeight: 1.5 }}>
            Бесплатно для всех студентов и школьников
          </p>
        </div>

        {/* Right — form panel */}
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', margin: '0 0 0.375rem', color: 'var(--ink)' }}>
              Создать аккаунт
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', margin: 0 }}>
              Уже есть аккаунт?{' '}
              <a href="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Войти</a>
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}