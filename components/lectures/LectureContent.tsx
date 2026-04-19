'use client';

// components/lectures/LectureContent.tsx
// Renders sanitised HTML and fires the visit API call (fire-and-forget).

import { useEffect } from 'react';

interface Props {
  slug: string;
  contentHtml: string;
  visited: boolean;
}

export function LectureContent({ slug, contentHtml, visited }: Props) {
  useEffect(() => {
    // Fire-and-forget: record the visit on first load (LEC-04)
    fetch(`/api/progress/${slug}/visit`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return (
    <div
      className="prose prose-indigo max-w-none"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
