// app/(admin)/admin/page.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { getAllLectures } from '@/lib/services/lectures';
import { listAll } from '@/lib/services/users';

export default async function AdminPage() {
  await requireAdmin();
  const [lectures, users] = await Promise.all([getAllLectures(), listAll()]);
  const published = lectures.filter((l) => l.is_published).length;

  const stats = [
    { label: 'Лекций всего', value: lectures.length, href: '/admin/lectures', color: 'var(--primary)', bg: 'var(--primary-bg)' },
    { label: 'Опубликовано', value: published, href: '/admin/lectures', color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Пользователей', value: users.length, href: '/admin/users', color: '#b5700a', bg: 'var(--accent-bg)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.375rem' }}>Панель администратора</h1>
        <p style={{ color: 'var(--ink-3)', margin: 0, fontSize: '0.9rem' }}>Управление контентом и пользователями</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '2.5rem', fontFamily: 'Unbounded, sans-serif', fontWeight: 900, color: s.color, margin: '0 0 0.25rem', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', margin: 0 }}>{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin/lectures/new" className="btn btn-primary" style={{ width: 'auto' }}>+ Новая лекция</Link>
        <Link href="/admin/lectures" className="btn btn-outline">Управление лекциями</Link>
        <Link href="/admin/users" className="btn btn-outline">Пользователи</Link>
      </div>
    </div>
  );
}
