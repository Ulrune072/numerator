'use client';
// components/admin/LectureEditor.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Lecture } from '@/lib/types/database';
import { toSlug } from '@/lib/utils/transliterate';

interface Props { lecture?: Partial<Lecture>; nextOrderIndex?: number }

export function LectureEditor({ lecture, nextOrderIndex = 1 }: Props) {
  const router = useRouter();
  const isEdit = !!lecture?.id;

  const [form, setForm] = useState({
    title: lecture?.title ?? '',
    slug: lecture?.slug ?? '',
    description: lecture?.description ?? '',
    content_html: lecture?.content_html ?? '',
    order_index: lecture?.order_index ?? nextOrderIndex,
    is_published: lecture?.is_published ?? false,
    min_score: lecture?.min_score ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'info' | 'content'>('info');

  function set(field: string, value: unknown) { setForm((p) => ({ ...p, [field]: value })); }

  function handleTitleChange(title: string) {
    set('title', title);
    if (!isEdit) {
      set('slug', toSlug(title));
    }
  }

  async function handleSubmit() {
    setSaving(true); setError(null);
    const res = await fetch(isEdit ? `/api/lectures/${lecture!.id}` : '/api/lectures', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const b = await res.json();
      setError(b.message ?? b.error ?? 'Ошибка сохранения');
      return;
    }
    router.push('/admin/lectures');
    router.refresh();
  }

  const tabStyle = (t: 'info' | 'content'): React.CSSProperties => ({
    padding: '0.5rem 1.125rem',
    border: 'none',
    borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
    background: 'transparent',
    color: tab === t ? 'var(--primary)' : 'var(--ink-3)',
    fontFamily: 'Golos Text, sans-serif',
    fontSize: '0.9rem',
    fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '-1px',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem' }}>
        <button type="button" style={tabStyle('info')} onClick={() => setTab('info')}>
          Основное
        </button>
        <button type="button" style={tabStyle('content')} onClick={() => setTab('content')}>
          Содержание
        </button>
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>

          <div>
            <label className="field-label">Название лекции</label>
            <input
              type="text"
              value={form.title}
              required
              placeholder="Например: Количественные числительные"
              onChange={(e) => handleTitleChange(e.target.value)}
              className="field-input"
              style={{ fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="field-label">
                Slug
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-3)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                  — используется в URL
                </span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-2)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)' }}>
                <span style={{ padding: '0 0.625rem', color: 'var(--ink-3)', fontSize: '0.875rem', background: 'var(--surface-2)', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  /lectures/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  required
                  onChange={(e) => set('slug', e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '0.625rem 0.75rem', flex: 1, fontFamily: 'monospace', fontSize: '0.875rem', background: 'transparent', color: 'var(--ink)' }}
                />
              </div>
            </div>
            <div style={{ width: '100px' }}>
              <label className="field-label">Порядок</label>
              <input
                type="number"
                value={form.order_index}
                min={0}
                onChange={(e) => set('order_index', Number(e.target.value))}
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Краткое описание</label>
            <input
              type="text"
              value={form.description}
              placeholder="Отображается в карточке лекции"
              onChange={(e) => set('description', e.target.value)}
              className="field-input"
            />
          </div>

          {/* Min score requirement */}
          <div style={{
            padding: '1rem 1.125rem',
            background: form.min_score > 0 ? 'var(--accent-bg)' : 'var(--surface-2)',
            border: `1.5px solid ${form.min_score > 0 ? 'rgba(232,153,58,0.3)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem', color: form.min_score > 0 ? '#b5700a' : 'var(--ink-2)' }}>
                  Минимальный балл для доступа
                </p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>
                  {form.min_score > 0
                    ? `Лекция закрыта до ${form.min_score} баллов`
                    : 'Открыта для всех студентов'}
                </p>
              </div>
              <input
                type="number"
                value={form.min_score}
                min={0}
                step={10}
                onChange={(e) => set('min_score', Number(e.target.value))}
                className="field-input"
                style={{ width: '100px', textAlign: 'center', fontWeight: 600, flexShrink: 0 }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[0, 100, 300, 600, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('min_score', v)}
                    className="btn btn-sm"
                    style={{
                      background: form.min_score === v ? 'var(--accent)' : 'var(--surface)',
                      color: form.min_score === v ? '#fff' : 'var(--ink-3)',
                      border: '1px solid var(--border-2)',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.625rem',
                    }}
                  >
                    {v === 0 ? 'Открыто' : `${v} б.`}
                  </button>
                ))}
              </div>
          </div>

          {/* Publish toggle */}
          <div
            onClick={() => set('is_published', !form.is_published)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.125rem',
              background: form.is_published ? 'var(--success-bg)' : 'var(--surface-2)',
              border: `1.5px solid ${form.is_published ? 'rgba(45,122,79,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              userSelect: 'none',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem', color: form.is_published ? 'var(--success)' : 'var(--ink-2)' }}>
                {form.is_published ? 'Опубликована' : 'Черновик'}
              </p>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>
                {form.is_published ? 'Лекция видна всем студентам' : 'Лекция скрыта от студентов'}
              </p>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 44, height: 24, borderRadius: 99,
              background: form.is_published ? 'var(--success)' : 'var(--border-2)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: form.is_published ? 23 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Content tab */}
      {tab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink-3)' }}>
              Используйте HTML-разметку. Теги: <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: '3px' }}>&lt;h2&gt;</code>, <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: '3px' }}>&lt;p&gt;</code>, <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: '3px' }}>&lt;ul&gt;</code>
            </p>
            {form.content_html && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-3)' }}>
                {form.content_html.length} символов
              </span>
            )}
          </div>
          <textarea
            value={form.content_html}
            rows={22}
            placeholder="<h2>Введение</h2>&#10;<p>Числительные — это...</p>"
            onChange={(e) => set('content_html', e.target.value)}
            style={{
              width: '100%',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.875rem',
              lineHeight: 1.65,
              padding: '1rem',
              border: '1.5px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              background: '#FAFAF8',
              color: 'var(--ink)',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(61,90,153,0.1)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      )}

      {/* Footer actions — always visible */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="btn btn-primary"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          {saving
            ? 'Сохранение…'
            : isEdit ? 'Сохранить изменения' : 'Создать лекцию'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/lectures')}
          className="btn btn-outline"
        >
          Отмена
        </button>
        {isEdit && (
          <a
            href={`/lectures/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            Просмотреть на сайте ↗
          </a>
        )}
      </div>

      {error && <div style={{ marginTop: '0.75rem' }}><ErrorMessage message={error} /></div>}
    </div>
  );
}