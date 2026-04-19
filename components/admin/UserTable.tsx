'use client';
// components/admin/UserTable.tsx
import { useState, useTransition } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { AdminUserDTO, Role } from '@/lib/types/database';

interface Props { users: AdminUserDTO[]; currentUserId: string; onRefresh: () => void }

export function UserTable({ users, currentUserId, onRefresh }: Props) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{ type: 'delete' | 'reset'; userId: string; username: string } | null>(null);

  async function handleRoleChange(userId: string, role: Role) {
    await fetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    startTransition(onRefresh);
  }

  async function handleReset(userId: string) {
    await fetch(`/api/admin/users/${userId}/reset-progress`, { method: 'POST' });
    setDialog(null); startTransition(onRefresh);
  }

  async function handleDelete(userId: string) {
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    setDialog(null); startTransition(onRefresh);
  }

  return (
    <>
      <div className="card" style={{ overflow: 'hidden', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <table>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th style={{ width: '120px' }}>Роль</th>
              <th style={{ width: '90px' }}>Баллы</th>
              <th style={{ width: '90px' }}>Лекций</th>
              <th style={{ width: '140px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-bg)', border: '1px solid rgba(61,90,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                      {u.username}
                      {u.id === currentUserId && <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: 'var(--ink-3)' }}>(вы)</span>}
                    </span>
                  </div>
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>{u.email}</td>
                <td>
                  <select value={u.role} disabled={u.id === currentUserId}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    style={{ background: u.role === 'admin' ? 'var(--accent-bg)' : 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '0.8125rem', fontWeight: 600, color: u.role === 'admin' ? '#b5700a' : 'var(--ink-3)', cursor: 'pointer', opacity: u.id === currentUserId ? 0.5 : 1 }}>
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.total_score}</td>
                <td style={{ color: 'var(--ink-2)' }}>{u.completed_lectures_count}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button type="button" disabled={u.id === currentUserId}
                      onClick={() => setDialog({ type: 'reset', userId: u.id, username: u.username })}
                      className="btn btn-sm" style={{ color: '#b5700a', background: 'var(--accent-bg)', border: 'none', opacity: u.id === currentUserId ? 0.4 : 1 }}>
                      Сброс
                    </button>
                    <button type="button" disabled={u.id === currentUserId}
                      onClick={() => setDialog({ type: 'delete', userId: u.id, username: u.username })}
                      className="btn btn-sm" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none', opacity: u.id === currentUserId ? 0.4 : 1 }}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog?.type === 'reset' && (
        <ConfirmDialog open title="Сбросить прогресс"
          description={`Удалить все попытки и баллы пользователя «${dialog.username}»?`}
          confirmLabel="Сбросить" danger
          onConfirm={() => handleReset(dialog.userId)}
          onCancel={() => setDialog(null)} />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog open title="Удалить пользователя"
          description={`Удалить аккаунт «${dialog.username}» и все его данные? Это нельзя отменить.`}
          confirmLabel="Удалить" danger
          onConfirm={() => handleDelete(dialog.userId)}
          onCancel={() => setDialog(null)} />
      )}
    </>
  );
}
