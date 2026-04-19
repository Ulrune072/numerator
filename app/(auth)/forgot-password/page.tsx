// app/(auth)/forgot-password/page.tsx
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Числитель
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Восстановление пароля
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            ← Вернуться ко входу
          </a>
        </p>
      </div>
    </main>
  );
}
