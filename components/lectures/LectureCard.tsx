// components/lectures/LectureCard.tsx
import Link from 'next/link';
import type { LectureListItem } from '@/lib/types/database';

interface Props { lecture: LectureListItem }

export function LectureCard({ lecture }: Props) {
  if (lecture.locked) {
    return (
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', opacity: 0.7, cursor: 'not-allowed', position: 'relative', overflow: 'hidden' }}>
        {/* Lock stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--border-2)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, margin: 0, color: 'var(--ink-3)', lineHeight: 1.35 }}>
            {lecture.title}
          </h2>
          <span className="badge badge-new" style={{ flexShrink: 0 }}>🔒 Закрыто</span>
        </div>
        {lecture.description && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink-3)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {lecture.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
            Нужно {lecture.min_score} баллов
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/lectures/${lecture.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card card-hover" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, margin: 0, color: 'var(--ink)', lineHeight: 1.35 }}>
            {lecture.title}
          </h2>
          {lecture.completed
            ? <span className="badge badge-done">✓ Готово</span>
            : lecture.visited
              ? <span className="badge badge-active">В процессе</span>
              : <span className="badge badge-new">Новая</span>
          }
        </div>
        {lecture.description && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink-3)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {lecture.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
            Читать →
          </span>
          {lecture.min_score > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>
              от {lecture.min_score} б.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
