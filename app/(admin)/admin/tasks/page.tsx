// app/(admin)/admin/tasks/page.tsx

import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { getAllLectures } from '@/lib/services/lectures';

export default async function AdminTasksIndexPage() {
  await requireAdmin();
  const lectures = await getAllLectures();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Задания</h1>
          <p className="admin-page-subtitle">Выберите лекцию для управления заданиями</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Лекция</th>
              <th style={{ width: '130px' }}>Статус</th>
              <th style={{ width: '120px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map((l) => (
              <tr key={l.id}>
                <td style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{l.order_index}</td>
                <td>
                  <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{l.title}</span>
                  <code style={{ marginLeft: '0.625rem', fontSize: '0.775rem', color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '3px' }}>{l.slug}</code>
                </td>
                <td>
                  <span className={`badge ${l.is_published ? 'badge-done' : 'badge-new'}`}>
                    {l.is_published ? '● Опубликована' : '○ Черновик'}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/tasks/${l.id}`} className="btn btn-ghost btn-sm">
                    Задания →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
