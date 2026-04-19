'use client';

// components/admin/LectureEditor.tsx
// Simple textarea for content_html; replace with TipTap/Quill if WYSIWYG needed.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Lecture } from '@/lib/types/database';

interface Props {
  lecture?: Partial<Lecture>;  // undefined = create mode
}

export function LectureEditor({ lecture }: Props) {
  const router = useRouter();
  const isEdit = !!lecture?.id;

  const [form, setForm] = useState({
    title: lecture?.title ?? '',
    slug: lecture?.slug ?? '',
    description: lecture?.description ?? '',
    content_html: lecture?.content_html ?? '',
    order_index: lecture?.order_index ?? 0,
    is_published: lecture?.is_published ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Auto-generate slug from title in create mode
  function handleTitleChange(title: string) {
    set('title', title);
    if (!isEdit) {
      const slug = title
        .toLowerCase()
        .replace(/[^а-яёa-z0-9\s-]/gi, '')
        .trim()
        .replace(/\s+/g, '-');
      set('slug', slug);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const url = isEdit ? `/api/lectures/${lecture!.id}` : '/api/lectures';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.message ?? body.error ?? 'Ошибка сохранения');
      return;
    }

    router.push('/admin/lectures');
    router.refresh();
  }

  const inputCls =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700">Название</label>
        <input
          type="text" value={form.title} required
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text" value={form.slug} required
          onChange={(e) => set('slug', e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Описание</label>
        <input
          type="text" value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Порядковый номер</label>
        <input
          type="number" value={form.order_index} min={0}
          onChange={(e) => set('order_index', Number(e.target.value))}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Содержание (HTML)
        </label>
        <textarea
          value={form.content_html} rows={12}
          onChange={(e) => set('content_html', e.target.value)}
          className={inputCls + ' font-mono text-xs'}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_published" type="checkbox" checked={form.is_published}
          onChange={(e) => set('is_published', e.target.checked)}
          className="rounded border-gray-300 text-indigo-600"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
          Опубликовать
        </label>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-3 pt-2">
        <button
          type="button" disabled={saving} onClick={handleSubmit}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button" onClick={() => router.push('/admin/lectures')}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
