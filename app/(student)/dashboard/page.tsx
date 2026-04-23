// app/(student)/dashboard/page.tsx
import Link from 'next/link';
import { requireAuth } from '@/lib/utils/auth';
import { createClient } from '@/lib/supabase/server';
import { getPublishedLectures } from '@/lib/services/lectures';
import { getBestResult } from '@/lib/services/progress';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import type { Profile } from '@/lib/types/database';

export default async function DashboardPage() {
  const session = await requireAuth();
  const supabase = createClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single<Profile>();
  if (!profile) return null;

  const lectures = await getPublishedLectures(session.user.id, profile.total_score);
  const unlockedLectures = lectures.filter((l) => !l.locked);
  const lockedLectures   = lectures.filter((l) =>  l.locked);

  const bestResults = await Promise.all(unlockedLectures.map((l) => getBestResult(session.user.id, l.id)));
  const completedCount = unlockedLectures.filter((l) => l.completed).length;

  return (
    <div className="page">
      <div style={{ display: 'grid', gap: '1.5rem' }}>

        {/* Hero card */}
        <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--ink) 0%, #2D3F6E 100%)', border: 'none', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(232,153,58,0.12)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Добро пожаловать</p>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'Playfair Display, serif', margin: 0, color: '#fff' }}>{profile.username}</h1>
            </div>
            <div style={{ background: 'rgba(232,153,58,0.2)', border: '1px solid rgba(232,153,58,0.35)', borderRadius: '99px', padding: '0.375rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>
              {getBadgeLabel(profile.total_score)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '3rem', fontFamily: 'Unbounded, sans-serif', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{profile.total_score}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>баллов</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>
              <span>Прогресс</span>
              <span>{completedCount} из {unlockedLectures.length} доступных лекций</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent) 0%, #f0b85a 100%)', borderRadius: '99px', width: `${unlockedLectures.length ? Math.round((completedCount / unlockedLectures.length) * 100) : 0}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* Score progress */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.875rem' }}>До следующего уровня</p>
          <ProgressBar totalScore={profile.total_score} />
        </div>

        {/* Unlocked lectures */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Мои лекции</h2>
            <Link href="/lectures" className="btn btn-ghost btn-sm">Все лекции →</Link>
          </div>

          {unlockedLectures.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
              Лекции пока не опубликованы.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {unlockedLectures.map((lecture, i) => {
                const best = bestResults[i];
                return (
                  <div key={lecture.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Link href={`/lectures/${lecture.slug}`} style={{ fontWeight: 500, color: 'var(--ink)', textDecoration: 'none', fontSize: '0.9375rem', display: 'block' }}>
                        {lecture.title}
                      </Link>
                      {best.total > 0 && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', margin: '0.125rem 0 0' }}>
                          Лучший результат: {best.correct}/{best.total}
                        </p>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {lecture.completed
                        ? <span className="badge badge-done">✓ Выполнено</span>
                        : lecture.visited
                          ? <Link href={`/tasks/${lecture.slug}`} className="btn btn-outline btn-sm">Продолжить →</Link>
                          : <Link href={`/lectures/${lecture.slug}`} className="btn btn-ghost btn-sm">Начать</Link>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Locked lectures */}
        {lockedLectures.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: '0 0 1rem' }}>
              🔒 Закрытые лекции
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lockedLectures.map((lecture) => (
                <div key={lecture.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', opacity: 0.65 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 500, color: 'var(--ink-3)', fontSize: '0.9375rem', margin: 0 }}>
                      {lecture.title}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Нужно {lecture.min_score} б.
                    </span>
                    <span className="badge badge-new">Закрыто</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Motivational hint */}
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', margin: '0.75rem 0 0', textAlign: 'center' }}>
              Выполняйте задания, чтобы открыть новые лекции
            </p>
          </div>
        )}

        {/* Quick nav */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/lectures" className="btn btn-primary" style={{ width: 'auto' }}>Перейти к лекциям</Link>
          <Link href="/diagnostic" className="btn btn-outline">Диагностика</Link>
        </div>
      </div>
    </div>
  );
}

function getBadgeLabel(score: number): string {
  if (score >= 1000) return 'Числитель ⭐';
  if (score >= 600)  return 'Мастер';
  if (score >= 300)  return 'Знаток';
  if (score >= 100)  return 'Ученик';
  return 'Новичок';
}