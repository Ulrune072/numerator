// app/(student)/lectures/page.tsx
import { requireAuth } from '@/lib/utils/auth';
import { getPublishedLectures } from '@/lib/services/lectures';
import { LectureCard } from '@/components/lectures/LectureCard';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

export default async function LecturesPage() {
  const session = await requireAuth();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles').select('total_score').eq('id', session.user.id).single<Pick<Profile, 'total_score'>>();
  const userScore = profile?.total_score ?? 0;
  const lectures = await getPublishedLectures(session.user.id, userScore);

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Лекции</h1>
        <p style={{ color: 'var(--ink-3)', margin: 0 }}>
          {lectures.length} {getLecturesWord(lectures.length)} — читайте и проходите задания
        </p>
      </div>

      {lectures.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>
          Лекции пока не опубликованы.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {lectures.map((lecture) => <LectureCard key={lecture.id} lecture={lecture} />)}
        </div>
      )}
    </div>
  );
}

function getLecturesWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'лекция';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'лекции';
  return 'лекций';
}
