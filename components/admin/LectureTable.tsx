'use client';
// components/admin/LectureTable.tsx
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ConfirmDialog } from './ConfirmDialog';
import type { Lecture } from '@/lib/types/database';

interface Props { lectures: Lecture[]; onRefresh: () => void }

export function LectureTable({ lectures, onRefresh }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Lecture | null>(null);

  async function handlePublishToggle(id: string, current: boolean) {
    await fetch(`/api/lectures/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_published: !current }) });
    startTransition(onRefresh);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/lectures/${id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    startTransition(onRefresh);
  }

  return (
    <>
      <div className="card" style={{ overflow: 'hidden', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '48px' }}>#</th>
              <th>Название</th>
              <th>Slug</th>
              <th style={{ width: '140px' }}>Статус</th>
              <th style={{ width: '200px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map((l) => (
              <tr key={l.id}>
                <td style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{l.order_index}</td>
                <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{l.title}</td>
                <td><code style={{ fontSize: '0.8125rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--ink-3)' }}>{l.slug}</code></td>
                <td>
                  <button type="button" onClick={() => handlePublishToggle(l.id, l.is_published)}
                    className={`badge ${l.is_published ? 'badge-done' : 'badge-new'}`}
                    style={{ cursor: 'pointer', border: 'none', font: 'inherit', transition: 'all 0.15s' }}>
                    {l.is_published ? '● Опубликована' : '○ Черновик'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Link href={`/admin/lectures/${l.id}/edit`} className="btn btn-ghost btn-sm">Изменить</Link>
                    <Link href={`/admin/tasks/${l.id}`} className="btn btn-ghost btn-sm">Задания</Link>
                    <button type="button" onClick={() => setDeleteTarget(l)} className="btn btn-sm" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog open title="Удалить лекцию"
          description={`Удалить «${deleteTarget.title}»? Все задания и прогресс пользователей будут удалены.`}
          confirmLabel="Удалить" danger
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
