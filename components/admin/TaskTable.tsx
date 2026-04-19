'use client';

// components/admin/TaskTable.tsx

import { useState, useTransition } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { TaskDTO } from '@/lib/types/database';

interface Props {
  tasks: TaskDTO[];
  onEdit: (task: TaskDTO) => void;
  onRefresh: () => void;
}

export function TaskTable({ tasks, onEdit, onRefresh }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<TaskDTO | null>(null);

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    startTransition(onRefresh);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['#', 'Вопрос', 'Правильный ответ', 'Баллы', 'Действия'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {tasks.map((t) => (
              <tr key={t.id} className={isPending ? 'opacity-60' : ''}>
                <td className="px-4 py-3 text-gray-400">{t.order_index}</td>
                <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{t.question_text}</td>
                <td className="px-4 py-3 text-gray-600">
                  {(t.options as string[])[t.correct_index]}
                </td>
                <td className="px-4 py-3 text-gray-700">{t.score_value}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          open
          title="Удалить задание"
          description={`Удалить вопрос «${deleteTarget.question_text}»?`}
          confirmLabel="Удалить"
          danger
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
