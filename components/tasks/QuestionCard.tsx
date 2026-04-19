'use client';
// components/tasks/QuestionCard.tsx
import { useState } from 'react';
import { AnswerOption } from './AnswerOption';
import type { StudentTaskDTO, AttemptResultDTO } from '@/lib/types/database';

interface Props {
  task: StudentTaskDTO; questionNumber: number; totalQuestions: number;
  attemptNumber: number; onNext: (result: AttemptResultDTO) => void;
}

export function QuestionCard({ task, questionNumber, totalQuestions, attemptNumber, onNext }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<AttemptResultDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (selectedIndex === null || loading) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, lecture_id: task.lecture_id, selected_index: selectedIndex, attempt_number: attemptNumber }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch { setError('Не удалось отправить ответ. Попробуйте ещё раз.'); }
    finally { setLoading(false); }
  }

  const revealed = result !== null;

  return (
    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', fontWeight: 500 }}>
          Вопрос {questionNumber} / {totalQuestions}
        </span>
        {result && (
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: result.is_correct ? 'var(--success)' : 'var(--danger)' }}>
            {result.is_correct ? `+${result.score_awarded} баллов` : 'Неверно'}
          </span>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i < questionNumber - 1 ? 'var(--primary)' : i === questionNumber - 1 ? 'var(--accent)' : 'var(--border)' }} />
        ))}
      </div>

      <p style={{ fontSize: '1.0625rem', fontFamily: 'Playfair Display, serif', fontWeight: 500, color: 'var(--ink)', margin: 0, lineHeight: 1.45 }}>
        {task.question_text}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {(task.options as string[]).map((option, i) => (
          <AnswerOption key={i} index={i} text={option} selected={selectedIndex === i}
            revealed={revealed} isCorrect={revealed && result!.is_correct && selectedIndex === i}
            onSelect={setSelectedIndex} />
        ))}
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

      {!revealed ? (
        <button type="button" disabled={selectedIndex === null || loading} onClick={handleSubmit} className="btn btn-primary">
          {loading ? 'Проверка…' : 'Ответить'}
        </button>
      ) : (
        <button type="button" onClick={() => onNext(result!)} className="btn btn-primary">
          {questionNumber < totalQuestions ? 'Следующий вопрос →' : 'Посмотреть результаты'}
        </button>
      )}
    </div>
  );
}
