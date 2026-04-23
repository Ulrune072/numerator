// app/(student)/diagnostic/page.tsx
// DIAG-01–03: Intro text + embedded Google Form iframe.

import { requireAuth } from '@/lib/utils/auth';

// Replace this URL with the actual published Google Form embed link.
const GOOGLE_FORM_URL =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_FORM_URL ??
  'https://docs.google.com/forms/d/e/PLACEHOLDER/viewform?embedded=true';

export default async function DiagnosticPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Диагностика</h1>
        <p className="mt-2 text-gray-600 max-w-prose">
          Пройдите диагностический тест, чтобы определить свой начальный уровень
          знания числительных русского языка. Тест не влияет на ваши баллы —
          он помогает понять, с чего лучше начать обучение.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm overflow-hidden">
        <iframe
          src={GOOGLE_FORM_URL}
          width="100%"
          height="700"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Диагностический тест"
          className="block"
        >
          Загрузка…
        </iframe>
      </div>
    </div>
  );
}
