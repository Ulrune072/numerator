// app/(admin)/admin/layout.tsx

import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-bold hover:text-indigo-200">
              Числитель — Админ
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/lectures" className="hover:text-indigo-200">Лекции</Link>
              <Link href="/admin/tasks" className="hover:text-indigo-200">Задания</Link>
              <Link href="/admin/users" className="hover:text-indigo-200">Пользователи</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hover:text-indigo-200">← На сайт</Link>
            <LogoutButton className="text-white hover:text-indigo-200 text-sm font-medium" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
