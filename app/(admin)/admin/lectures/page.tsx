'use client';

// app/(admin)/admin/lectures/page.tsx

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LectureTable } from '@/components/admin/LectureTable';
import type { Lecture } from '@/lib/types/database';

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/lectures');
    const data = await res.json();
    setLectures(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Лекции</h1>
        <Link
          href="/admin/lectures/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Добавить
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Загрузка…</p>
      ) : (
        <LectureTable lectures={lectures} onRefresh={load} />
      )}
    </div>
  );
}
