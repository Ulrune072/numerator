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
  let stateClass = '';

  if (!revealed) {
    if (selected) stateClass = 'selected';
  } else {
    if (isCorrect) {
      stateClass = 'correct';
    } else if (selected) {
      stateClass = 'wrong';
    } else {
      stateClass = 'dimmed';
    }
  }

  return (
    <button
      type="button"
      className={`answer-btn ${stateClass}`}
      disabled={revealed}
      onClick={() => onSelect(index)}
    >
      <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
      {text}
    </button>
  );
}