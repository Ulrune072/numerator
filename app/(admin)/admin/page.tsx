// app/(admin)/admin/page.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { getAllLectures } from '@/lib/services/lectures';
import { listAll } from '@/lib/services/users';

export default async function AdminPage() {
  await requireAdmin();
  const [lectures, users] = await Promise.all([getAllLectures(), listAll()]);
  const published = lectures.filter((l) => l.is_published).length;
  const drafts = lectures.length - published;
  const totalScore = users.reduce((s, u) => s + u.total_score, 0);

  const stats = [
    { label: 'Лекций всего',   value: lectures.length, accent: '#3D5A99', href: '/admin/lectures' },
    { label: 'Опубликовано',   value: published,        accent: '#2D7A4F', href: '/admin/lectures' },
    { label: 'Черновики',      value: drafts,           accent: '#8A8AAA', href: '/admin/lectures' },
    { label: 'Пользователей',  value: users.length,     accent: '#E8993A', href: '/admin/users'    },
  ];

  const recentUsers = users.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Обзор</h1>
          <p className="admin-page-subtitle">Добро пожаловать в панель управления</p>
        </div>
        <Link href="/admin/lectures/new" className="btn btn-primary" style={{ width: 'auto' }}>
          + Новая лекция
        </Link>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-stat-card">
            <div className="admin-stat-card-accent" style={{ background: s.accent }} />
            <p className="admin-stat-label">{s.label}</p>
            <p className="admin-stat-value" style={{ color: s.accent }}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent users */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0, fontFamily: 'Golos Text, sans-serif', fontWeight: 600, color: 'var(--ink)' }}>Пользователи</h2>
            <Link href="/admin/users" className="btn btn-ghost btn-sm">Все →</Link>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th style={{ width: '80px' }}>Роль</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Баллы</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '0.875rem' }}>{u.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-status' : 'badge-new'}`} style={{ fontSize: '0.75rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{u.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lectures list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0, fontFamily: 'Golos Text, sans-serif', fontWeight: 600, color: 'var(--ink)' }}>Лекции</h2>
            <Link href="/admin/lectures" className="btn btn-ghost btn-sm">Все →</Link>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th style={{ width: '110px' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {lectures.slice(0, 5).map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '0.875rem', maxWidth: '180px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${l.is_published ? 'badge-done' : 'badge-new'}`} style={{ fontSize: '0.75rem' }}>
                        {l.is_published ? '● Опубл.' : '○ Черн.'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Total score stat */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink)', border: 'none' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Суммарно баллов набрано</p>
          <p style={{ fontSize: '1.75rem', fontFamily: 'Unbounded, sans-serif', fontWeight: 900, color: 'var(--accent)', margin: 0, lineHeight: 1 }}>{totalScore}</p>
        </div>
        <Link href="/admin/users" className="btn btn-outline" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}>
          Управление пользователями →
        </Link>
      </div>
    </div>
  );
}