'use client';

// components/auth/ForgotPasswordForm.tsx

import { useFormState } from 'react-dom';
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from '@/app/(auth)/forgot-password/actions';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const initialState: ForgotPasswordState = { error: null, sent: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useFormState(
    forgotPasswordAction,
    initialState,
  );

  if (state.sent) {
    return (
      <div className="rounded-lg bg-white p-8 shadow text-center space-y-2">
        <p className="text-green-700 font-medium">Письмо отправлено!</p>
        <p className="text-sm text-gray-600">
          Если этот email зарегистрирован, вы получите ссылку для сброса пароля.
          Проверьте папку «Спам», если письмо не пришло.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg bg-white p-8 shadow">
      <p className="text-sm text-gray-600">
        Введите ваш email — мы пришлём ссылку для сброса пароля.
      </p>

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

      {state.error && <ErrorMessage message={state.error} />}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Отправка…' : 'Отправить ссылку'}
      </button>
    </form>
  );
}
