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
    const [usersRes, sessionRes] = await Promise.all([fetch('/api/admin/users'), fetch('/api/auth/me')]);
    setUsers(await usersRes.json());
    if (sessionRes.ok) { const me = await sessionRes.json(); setCurrentUserId(me.id ?? ''); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Пользователи</h1>
          <p className="admin-page-subtitle">{users.length} зарегистрировано</p>
        </div>
      </div>
      {loading
        ? <div className="admin-table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>Загрузка…</div>
        : <div className="admin-table-wrap"><UserTable users={users} currentUserId={currentUserId} onRefresh={load} /></div>
      }
    </div>
  );
}
