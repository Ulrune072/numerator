// components/dashboard/StatusBadge.tsx

import { getStatus } from '@/lib/utils/status';

interface Props {
  totalScore: number;
}

const STATUS_COLORS: Record<string, string> = {
  'Новичок':       'bg-gray-100 text-gray-700',
  'Ученик':        'bg-blue-100 text-blue-700',
  'Знаток':        'bg-indigo-100 text-indigo-700',
  'Мастер':        'bg-purple-100 text-purple-700',
  'Числитель ⭐':  'bg-yellow-100 text-yellow-800',
};

export function StatusBadge({ totalScore }: Props) {
  const status = getStatus(totalScore);
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
      {status}
    </span>
  );
}
