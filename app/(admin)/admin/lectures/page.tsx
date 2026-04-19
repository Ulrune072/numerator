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
    setLectures(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Лекции</h1>
          <p className="admin-page-subtitle">Нажмите на статус для быстрой публикации</p>
        </div>
        <Link href="/admin/lectures/new" className="btn btn-primary" style={{ width: 'auto' }}>+ Добавить</Link>
      </div>
      {loading
        ? <div className="admin-table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>Загрузка…</div>
        : lectures.length === 0
          ? <div className="admin-table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>Лекций пока нет.</div>
          : <div className="admin-table-wrap"><LectureTable lectures={lectures} onRefresh={load} /></div>
      }
    </div>
  );
}
