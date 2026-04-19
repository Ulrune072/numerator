'use client';

// components/auth/RegisterForm.tsx

import { useFormState } from 'react-dom';
import { registerAction, type RegisterState } from '@/app/(auth)/register/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: RegisterState = { error: null };

export function RegisterForm() {
  const [state, formAction, isPending] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg bg-white p-8 shadow">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Имя пользователя
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {state.error && <ErrorMessage message={state.error} />}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Регистрация…' : 'Создать аккаунт'}
      </button>
    </form>
  );
}
