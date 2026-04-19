'use client';
// components/admin/TaskEditor.tsx
import { useState } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { TaskDTO } from '@/lib/types/database';

interface Props {
  lectureId: string; task?: TaskDTO; nextOrderIndex: number;
  onSaved: () => void; onCancel: () => void;
}

export function TaskEditor({ lectureId, task, nextOrderIndex, onSaved, onCancel }: Props) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    question_text: task?.question_text ?? '',
    options: (task?.options as string[]) ?? ['', '', '', ''],
    correct_index: task?.correct_index ?? 0,
    score_value: task?.score_value ?? 10,
    order_index: task?.order_index ?? nextOrderIndex,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setOption(i: number, val: string) {
    const opts = [...form.options]; opts[i] = val; setForm((p) => ({ ...p, options: opts }));
  }

  async function handleSubmit() {
    setSaving(true); setError(null);
    const body = isEdit ? form : { ...form, lecture_id: lectureId };
    const res = await fetch(isEdit ? `/api/tasks/${task!.id}` : '/api/tasks', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Ошибка сохранения'); return; }
    onSaved();
  }

  return (
    <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--primary-bg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--primary)' }}>
        {isEdit ? 'Редактировать задание' : '+ Новое задание'}
      </h3>

      <div>
        <label className="field-label">Вопрос</label>
        <input type="text" value={form.question_text} required className="field-input"
          onChange={(e) => setForm((p) => ({ ...p, question_text: e.target.value }))} />
      </div>

      <div>
        <label className="field-label">Варианты ответа</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input type="radio" name="correct" checked={form.correct_index === i}
                onChange={() => setForm((p) => ({ ...p, correct_index: i }))}
                style={{ accentColor: 'var(--success)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} />
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: form.correct_index === i ? 'var(--success-bg)' : 'var(--surface-2)', border: `1px solid ${form.correct_index === i ? 'rgba(45,122,79,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: form.correct_index === i ? 'var(--success)' : 'var(--ink-3)', flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <input type="text" value={opt} required className="field-input" placeholder={`Вариант ${String.fromCharCode(65 + i)}`}
                onChange={(e) => setOption(i, e.target.value)} />
            </div>
          ))}
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', margin: 0 }}>Выберите радиокнопку рядом с правильным ответом.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Баллы за ответ</label>
          <input type="number" min={1} value={form.score_value} className="field-input"
            onChange={(e) => setForm((p) => ({ ...p, score_value: Number(e.target.value) }))} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="field-label">Порядок</label>
          <input type="number" min={0} value={form.order_index} className="field-input"
            onChange={(e) => setForm((p) => ({ ...p, order_index: Number(e.target.value) }))} />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" disabled={saving} onClick={handleSubmit} className="btn btn-primary" style={{ width: 'auto' }}>
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить задание'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">Отмена</button>
      </div>
    </div>
  );
}
