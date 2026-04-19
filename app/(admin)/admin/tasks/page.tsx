// app/(admin)/admin/tasks/page.tsx

import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { getAllLectures } from '@/lib/services/lectures';

export default async function AdminTasksIndexPage() {
  await requireAdmin();
  const lectures = await getAllLectures();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Задания</h1>
      <p className="text-sm text-gray-500">Выберите лекцию для управления заданиями.</p>

      <div className="space-y-2">
        {lectures.map((l) => (
          <Link
            key={l.id}
            href={`/admin/tasks/${l.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div>
              <span className="text-sm font-medium text-gray-900">{l.title}</span>
              <span className="ml-2 font-mono text-xs text-gray-400">{l.slug}</span>
            </div>
            <span className={`text-xs font-medium ${l.is_published ? 'text-green-600' : 'text-gray-400'}`}>
              {l.is_published ? 'Опубликована' : 'Черновик'} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
