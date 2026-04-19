'use client';

// app/(admin)/admin/tasks/[lectureId]/page.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TaskTable } from '@/components/admin/TaskTable';
import { TaskEditor } from '@/components/admin/TaskEditor';
import type { TaskDTO } from '@/lib/types/database';

export default function AdminTasksPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TaskDTO | null | 'new'>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/tasks?lectureId=${lectureId}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [lectureId]);

  useEffect(() => { load(); }, [load]);

  function handleSaved() {
    setEditing(null);
    load();
  }

  const nextOrderIndex = tasks.length > 0
    ? Math.max(...tasks.map((t) => t.order_index)) + 1
    : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Задания лекции</h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            + Добавить
          </button>
        )}
      </div>

      {editing === 'new' && (
        <TaskEditor
          lectureId={lectureId}
          nextOrderIndex={nextOrderIndex}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {editing && editing !== 'new' && (
        <TaskEditor
          lectureId={lectureId}
          task={editing}
          nextOrderIndex={nextOrderIndex}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Загрузка…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">Заданий пока нет. Добавьте первое!</p>
      ) : (
        <TaskTable
          tasks={tasks}
          onEdit={(t) => setEditing(t)}
          onRefresh={load}
        />
      )}
    </div>
  );
}
