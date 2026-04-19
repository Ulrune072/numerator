// app/(admin)/admin/lectures/new/page.tsx
import { requireAdmin } from '@/lib/utils/auth';
import { getAllLectures } from '@/lib/services/lectures';
import { LectureEditor } from '@/components/admin/LectureEditor';

export default async function NewLecturePage() {
  await requireAdmin();
  const lectures = await getAllLectures();
  const nextOrderIndex = lectures.length > 0
    ? Math.max(...lectures.map((l) => l.order_index)) + 1
    : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="admin-page-title">Новая лекция</h1>
        <p className="admin-page-subtitle">Заполните поля и нажмите «Создать»</p>
      </div>
      <div className="card" style={{ padding: '2rem' }}>
        <LectureEditor nextOrderIndex={nextOrderIndex} />
      </div>
    </div>
  );
}