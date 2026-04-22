// app/(student)/tasks/[lectureSlug]/page.tsx

import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/utils/auth';
import { getLectureBySlug } from '@/lib/services/lectures';
import { hasVisited, getBestResult, hasAttempted } from '@/lib/services/progress';
import { getTasksForStudent } from '@/lib/services/tasks';
import { TasksRunner } from '@/components/tasks/TasksRunner';

interface Props {
  params: { lectureSlug: string };
}

export default async function TasksPage({ params }: Props) {
  const session = await requireAuth();
  const { lectureSlug } = params;

  const lecture = await getLectureBySlug(lectureSlug);
  if (!lecture) notFound();

  const visited = await hasVisited(session.user.id, lectureSlug);
  if (!visited) redirect(`/lectures/${lectureSlug}`);

  const tasks = await getTasksForStudent(lecture.id);

  if (tasks.length === 0) {
    return (
      <div className="page-narrow">
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>
          К этой лекции ещё нет заданий.
        </div>
      </div>
    );
  }

  const [best, isRetry] = await Promise.all([
    getBestResult(session.user.id, lecture.id),
    hasAttempted(session.user.id, lecture.id),
  ]);

  return (
    <div className="page-narrow">
      <TasksRunner
        tasks={tasks}
        lectureSlug={lectureSlug}
        lectureTitle={lecture.title}
        isRetry={isRetry}
        lectureId={lecture.id}
      />
    </div>
  );
}