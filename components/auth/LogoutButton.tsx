'use client';

// components/auth/LogoutButton.tsx
// A single-purpose button that calls the logoutAction server action.
// Used in the main layout navigation.

import { logoutAction } from '@/app/(student)/actions';

interface Props {
  className?: string;
}

export function LogoutButton({ className }: Props) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          'text-sm font-medium text-gray-600 hover:text-gray-900'
        }
      >
        Выйти
      </button>
    </form>
  );
}
