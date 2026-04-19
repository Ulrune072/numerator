'use client';

// app/(admin)/admin/users/page.tsx

import { useEffect, useState, useCallback } from 'react';
import { UserTable } from '@/components/admin/UserTable';
import type { AdminUserDTO } from '@/lib/types/database';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [usersRes, sessionRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/auth/me'),
    ]);
    setUsers(await usersRes.json());
    if (sessionRes.ok) {
      const me = await sessionRes.json();
      setCurrentUserId(me.id ?? '');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Загрузка…</p>
      ) : (
        <UserTable users={users} currentUserId={currentUserId} onRefresh={load} />
      )}
    </div>
  );
}
