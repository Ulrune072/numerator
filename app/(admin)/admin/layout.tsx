// app/(admin)/admin/layout.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/utils/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const navItems = [
    { href: '/admin',           label: 'Обзор',          icon: '⊞' },
    { href: '/admin/lectures',  label: 'Лекции',         icon: '◧' },
    { href: '/admin/tasks',     label: 'Задания',        icon: '✎' },
    { href: '/admin/users',     label: 'Пользователи',   icon: '◉' },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar-logo">
          <span className="admin-sidebar-logo-text">Числ<span>и</span>тель</span>
          <span className="admin-sidebar-logo-sub">Панель управления</span>
        </Link>

        <div style={{ flex: 1, paddingTop: '0.5rem' }}>
          <p className="admin-nav-section">Контент</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav-item">
              <span className="admin-nav-item-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <Link href="/dashboard" className="admin-nav-item" style={{ marginBottom: '0.25rem' }}>
            <span className="admin-nav-item-icon">←</span>
            На сайт
          </Link>
          <div className="admin-nav-item" style={{ padding: '0.5rem 0.875rem', margin: '0.125rem 0.5rem' }}>
            <span className="admin-nav-item-icon">⎋</span>
            <LogoutButton className="admin-nav-link" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">{children}</main>
    </div>
  );
}