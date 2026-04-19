// lib/utils/status.ts
// Maps a user's total_score to a status label and progress metrics.

import type { Status } from '@/lib/types/database';

interface Threshold {
  label: Status;
  min: number;
  max: number | null; // null = no upper bound
}

const THRESHOLDS: Threshold[] = [
  { label: 'Новичок',        min: 0,    max: 99   },
  { label: 'Ученик',         min: 100,  max: 299  },
  { label: 'Знаток',         min: 300,  max: 599  },
  { label: 'Мастер',         min: 600,  max: 999  },
  { label: 'Числитель ⭐',   min: 1000, max: null },
];

/** Returns the status label for a given score. */
export function getStatus(totalScore: number): Status {
  const tier = THRESHOLDS.findLast((t) => totalScore >= t.min);
  return tier?.label ?? 'Новичок';
}

/**
 * Returns the score required to reach the next status level.
 * Returns null when the user has already reached the top tier.
 */
export function getNextThreshold(totalScore: number): number | null {
  const currentTierIndex = THRESHOLDS.findLastIndex((t) => totalScore >= t.min);
  const next = THRESHOLDS[currentTierIndex + 1];
  return next?.min ?? null;
}

/**
 * Returns a 0–100 percentage representing progress within the current tier.
 * 100 when at the top tier.
 */
export function getProgressPercent(totalScore: number): number {
  const currentTierIndex = THRESHOLDS.findLastIndex((t) => totalScore >= t.min);
  const current = THRESHOLDS[currentTierIndex];
  const next = THRESHOLDS[currentTierIndex + 1];

  if (!next) return 100; // top tier

  const rangeSize = next.min - current.min;
  const progress = totalScore - current.min;
  return Math.min(100, Math.round((progress / rangeSize) * 100));
}
