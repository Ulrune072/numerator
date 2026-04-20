'use client';
// components/tasks/TasksRunner.tsx

import { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { ResultsScreen } from './ResultsScreen';
import type { StudentTaskDTO, AttemptResultDTO } from '@/lib/types/database';

interface Props {
  tasks: StudentTaskDTO[];
  lectureSlug: string;
  lectureTitle: string;
  isRetry: boolean;
}

export function TasksRunner({ tasks, lectureSlug, lectureTitle, isRetry }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AttemptResultDTO[]>([]);
  const [finished, setFinished] = useState(false);

  const attemptNumber = isRetry ? 2 : 1;

  function handleNext(result: AttemptResultDTO) {
    const updated = [...results, result];
    setResults(updated);
    if (currentIndex + 1 >= tasks.length) {
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  if (finished) {
    return (
      <ResultsScreen
        lectureSlug={lectureSlug}
        lectureTitle={lectureTitle}
        results={results}
        totalQuestions={tasks.length}
        isRetry={isRetry}
      />
    );
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', fontWeight: 500, margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Задания
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.375rem', fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>
          {lectureTitle}
        </h1>
      </div>

      <QuestionCard
        key={tasks[currentIndex].id}
        task={tasks[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={tasks.length}
        attemptNumber={attemptNumber}
        onNext={handleNext}
      />
    </div>
  );
}