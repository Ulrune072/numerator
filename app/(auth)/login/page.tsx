// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';

interface Props {
  searchParams: { registered?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Числитель
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Войдите, чтобы продолжить обучение
          </p>
        </div>

        {searchParams.registered && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Аккаунт создан! Проверьте email для подтверждения, затем войдите.
          </div>
        )}

        {searchParams.error === 'auth_callback_failed' && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            Не удалось подтвердить сессию. Попробуйте ещё раз.
          </div>
        )}

        <LoginForm />

        <div className="flex justify-between text-sm text-gray-600">
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Создать аккаунт
          </a>
          <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Забыли пароль?
          </a>
        </div>
      </div>
    </main>
  );
}
