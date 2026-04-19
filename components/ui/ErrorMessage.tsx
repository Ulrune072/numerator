// components/ui/ErrorMessage.tsx
// Reusable inline error display for form validation and API errors.

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
