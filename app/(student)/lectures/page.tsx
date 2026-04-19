// app/(student)/lectures/page.tsx

import { requireAuth } from '@/lib/utils/auth';
import { getPublishedLectures } from '@/lib/services/lectures';
import { LectureCard } from '@/components/lectures/LectureCard';

export default async function LecturesPage() {
  const session = await requireAuth();
  const lectures = await getPublishedLectures(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Лекции</h1>

      {lectures.length === 0 ? (
        <p className="text-gray-500">Лекции пока не опубликованы.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lectures.map((lecture) => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))}
        </div>
      )}
    </div>
  );
}
