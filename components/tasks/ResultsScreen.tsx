'use client';
// components/tasks/ResultsScreen.tsx
import Link from 'next/link';
import type { AttemptResultDTO } from '@/lib/types/database';

interface Props {
  lectureSlug: string; lectureTitle: string;
  results: AttemptResultDTO[]; totalQuestions: number; isRetry: boolean;
}

export function ResultsScreen({ lectureSlug, lectureTitle, results, totalQuestions, isRetry }: Props) {
  const correct = results.filter((r) => r.is_correct).length;
  const scoreEarned = results.reduce((s, r) => s + r.score_awarded, 0);
  const totalScore = results.at(-1)?.total_score ?? 0;
  const percent = Math.round((correct / totalQuestions) * 100);
  const isPerfect = correct === totalQuestions;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem', lineHeight: 1 }}>{isPerfect ? '🏆' : percent >= 60 ? '✨' : '📚'}</div>
        <div style={{ fontSize: '3rem', fontFamily: 'Unbounded, sans-serif', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: '0.25rem' }}>
          {correct}/{totalQuestions}
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: '0.9375rem', margin: '0 0 1.5rem' }}>
          правильных ответов — {percent}%
        </p>

        {scoreEarned > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-bg)', border: '1px solid rgba(45,122,79,0.2)', borderRadius: '99px', padding: '0.375rem 1rem', marginBottom: '1.25rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>+{scoreEarned} баллов</span>
          </div>
        )}
        {isRetry && scoreEarned === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
            Повторное прохождение — баллы не начисляются.
          </p>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', margin: '0 0 0.25rem' }}>Всего баллов</p>
          <p style={{ fontSize: '2rem', fontFamily: 'Unbounded, sans-serif', fontWeight: 900, color: 'var(--ink)', margin: 0 }}>{totalScore}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href={`/lectures/${lectureSlug}`} className="btn btn-outline" style={{ flex: 1 }}>← К лекции</Link>
        <Link href={`/tasks/${lectureSlug}`} className="btn btn-outline" style={{ flex: 1 }}>Пройти снова</Link>
        <Link href="/dashboard" className="btn btn-primary" style={{ flex: 1, width: 'auto' }}>Личный кабинет</Link>
      </div>
    </div>
  );
}
