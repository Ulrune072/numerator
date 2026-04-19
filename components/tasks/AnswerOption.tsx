'use client';

// components/tasks/AnswerOption.tsx

interface Props {
  index: number;
  text: string;
  selected: boolean;
  revealed: boolean;   // true after the user has submitted
  isCorrect: boolean;  // only meaningful when revealed=true
  onSelect: (index: number) => void;
}

export function AnswerOption({ index, text, selected, revealed, isCorrect, onSelect }: Props) {
  let base =
    'w-full rounded-lg border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (!revealed) {
    base += selected
      ? ' border-indigo-500 bg-indigo-50 font-medium text-indigo-800'
      : ' border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50';
  } else {
    if (isCorrect) {
      base += ' border-green-500 bg-green-50 font-medium text-green-800 cursor-default';
    } else if (selected) {
      base += ' border-red-400 bg-red-50 text-red-800 cursor-default';
    } else {
      base += ' border-gray-200 bg-white text-gray-400 cursor-default';
    }
  }

  return (
    <button
      type="button"
      className={base}
      disabled={revealed}
      onClick={() => onSelect(index)}
    >
      <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
      {text}
    </button>
  );
}
