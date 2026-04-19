// app/(admin)/admin/lectures/[id]/edit/page.tsx

import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/utils/auth';
import { getLectureByIdAdmin } from '@/lib/services/lectures';
import { LectureEditor } from '@/components/admin/LectureEditor';

interface Props {
  params: { id: string };
}

export default async function EditLecturePage({ params }: Props) {
  await requireAdmin();
  const lecture = await getLectureByIdAdmin(params.id);
  if (!lecture) notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Редактировать лекцию</h1>
      <LectureEditor lecture={lecture} />
    </div>
  );
}
