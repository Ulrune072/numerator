// components/lectures/LectureCard.tsx
import Link from 'next/link';
import type { LectureListItem } from '@/lib/types/database';

interface Props { lecture: LectureListItem }

export function LectureCard({ lecture }: Props) {
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
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
            Читать →
          </span>
        </div>
      </div>
    </Link>
  );
}
