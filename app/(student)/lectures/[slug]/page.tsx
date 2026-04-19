// app/(student)/lectures/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/utils/auth';
import { getLectureBySlug } from '@/lib/services/lectures';
import { hasVisited } from '@/lib/services/progress';
import { LectureContent } from '@/components/lectures/LectureContent';

interface Props {
  params: { slug: string };
}

export default async function LecturePage({ params }: Props) {
  const session = await requireAuth();
  const lecture = await getLectureBySlug(params.slug);

  // LEC-05 / T-08: return 404 for unpublished or non-existent lectures
  if (!lecture) notFound();

  const visited = await hasVisited(session.user.id, params.slug);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{lecture.title}</h1>
        {lecture.description && (
          <p className="mt-1 text-gray-500">{lecture.description}</p>
        )}
      </div>

      <LectureContent
        slug={lecture.slug}
        contentHtml={lecture.content_html ?? ''}
        visited={visited}
      />

      <div className="border-t pt-6">
        {/* LEC-04: button is always rendered; href works once the visit is recorded.
            The visit fires on mount in LectureContent, so by the time the user
            scrolls down and clicks, visited will be true on next navigation. */}
        <Link
          href={`/tasks/${lecture.slug}`}
          className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Перейти к заданиям →
        </Link>
        <p className="mt-2 text-xs text-gray-400">
          Доступно после открытия лекции — сохраняется автоматически.
        </p>
      </div>
    </div>
  );
}
