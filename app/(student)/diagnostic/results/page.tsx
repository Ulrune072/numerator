// app/(student)/diagnostic/results/page.tsx
// Shows the user's diagnostic score and recommended learning level
// after the Google Form webhook has delivered the result.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─── Types (mirrors api-route.ts) ────────────────────────────

interface DiagnosticScore {
  correct: number;
  total: number;
  percent: number;
}

type DiagnosticLevel = 'beginner' | 'intermediate' | 'advanced';

interface DiagnosticResult {
  id: string;
  email: string | null;
  submittedAt: string;
  responses: Record<string, string>;
  score: DiagnosticScore | null;
  level: DiagnosticLevel;
  savedAt: string;
}

// ─── Level metadata ───────────────────────────────────────────

const LEVEL_META: Record<
  DiagnosticLevel,
  { label: string; description: string; color: string; bg: string; icon: string }
> = {
  beginner: {
    label: 'Начальный уровень',
    description:
      'Вы только начинаете изучать числительные. Рекомендуем начать с основ: простые числа от 1 до 20.',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: '🌱',
  },
  intermediate: {
    label: 'Средний уровень',
    description:
      'У вас есть базовые знания. Рекомендуем сосредоточиться на падежах числительных и сложных конструкциях.',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: '📘',
  },
  advanced: {
    label: 'Продвинутый уровень',
    description:
      'Отличный результат! Рекомендуем практиковать редкие формы, порядковые числительные и устную речь.',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: '🏆',
  },
};

// ─── Helpers ──────────────────────────────────────────────────

function ScoreRing({ percent }: { percent: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={percent >= 75 ? '#10b981' : percent >= 40 ? '#3b82f6' : '#f59e0b'}
        strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function DiagnosticResultsPage() {
  const [result, setResult]   = useState<DiagnosticResult | null>(null);
  const [status, setStatus]   = useState<'loading' | 'found' | 'not_found' | 'error'>('loading');
  const [email, setEmail]     = useState('');
  const [queried, setQueried] = useState(false);

  // Auto-fetch if email is stored in localStorage (set it when user logs in)
  useEffect(() => {
    const stored = localStorage.getItem('userEmail');
    if (stored) {
      setEmail(stored);
      fetchResult(stored);
    } else {
      setStatus('not_found');
    }
  }, []);

  async function fetchResult(emailToFetch: string) {
    setStatus('loading');
    setQueried(true);
    try {
      const res = await fetch(
        `/api/diagnostic/results?email=${encodeURIComponent(emailToFetch)}`
      );
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('error');
    }
  }

  // ── Render: loading ──────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Загружаем ваш результат…</p>
      </div>
    );
  }

  // ── Render: not found / manual lookup ────────────────────────
  if (status === 'not_found' || (status === 'error' && !result)) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Результат диагностики</h1>

        {queried && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {status === 'error'
              ? 'Ошибка при загрузке. Попробуйте ещё раз.'
              : 'Результат ещё не получен. Возможно, форма ещё обрабатывается — подождите минуту и попробуйте снова.'}
          </div>
        )}

        <p className="text-gray-600 text-sm">
          Введите email, который вы использовали в форме, чтобы найти свой результат.
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && fetchResult(email)}
          />
          <button
            onClick={() => fetchResult(email)}
            disabled={!email}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Найти
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Ещё не прошли тест?{' '}
          <Link href="/diagnostic" className="text-blue-600 hover:underline">
            Вернуться к форме
          </Link>
        </p>
      </div>
    );
  }

  // ── Render: result found ──────────────────────────────────────
  const meta    = LEVEL_META[result!.level];
  const percent = result!.score?.percent ?? null;
  const score   = result!.score;

  return (
    <div className="max-w-lg mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Результат диагностики</h1>
        <p className="text-sm text-gray-400 mt-1">
          Отправлено:{' '}
          {new Date(result!.submittedAt).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Score ring */}
      {percent !== null && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <ScoreRing percent={percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{percent}%</span>
              <span className="text-xs text-gray-500">правильных</span>
            </div>
          </div>
          {score && (
            <p className="text-sm text-gray-600">
              {score.correct} из {score.total} верных ответов
            </p>
          )}
        </div>
      )}

      {/* Level card */}
      <div className={`rounded-xl border p-5 ${meta.bg}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <p className={`font-semibold text-lg ${meta.color}`}>{meta.label}</p>
            <p className={`mt-1 text-sm ${meta.color} opacity-80`}>{meta.description}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Link
          href="/learn"
          className="flex-1 text-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Начать обучение →
        </Link>
        <Link
          href="/diagnostic"
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Пройти снова
        </Link>
      </div>
    </div>
  );
}
