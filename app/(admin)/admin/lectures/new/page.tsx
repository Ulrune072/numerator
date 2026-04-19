// app/(admin)/admin/lectures/new/page.tsx
import { requireAdmin } from '@/lib/utils/auth';
import { LectureEditor } from '@/components/admin/LectureEditor';

export default async function NewLecturePage() {
  await requireAdmin();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem' }}>Новая лекция</h1>
        <p style={{ color: 'var(--ink-3)', margin: 0, fontSize: '0.875rem' }}>Заполните поля и нажмите «Создать»</p>
      </div>
      <LectureEditor />
    </div>
  );
}
