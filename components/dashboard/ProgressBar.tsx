// components/dashboard/ProgressBar.tsx

import { getNextThreshold, getProgressPercent, getStatus } from '@/lib/utils/status';

interface Props {
  totalScore: number;
}

export function ProgressBar({ totalScore }: Props) {
  const percent = getProgressPercent(totalScore);
  const next = getNextThreshold(totalScore);
  const status = getStatus(totalScore);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{status}</span>
        {next !== null ? (
          <span> {totalScore} / {next} до следующего уровня</span>
        ) : (
          <span>Максимальный уровень 🎉</span>
        )}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
