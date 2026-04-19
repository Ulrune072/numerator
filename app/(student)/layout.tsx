// app/(student)/layout.tsx
import Link from 'next/link';
import { requireAuth } from '@/lib/utils/auth';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type { Profile } from '@/lib/types/database';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles').select('username, total_score').eq('id', session.user.id).single<Pick<Profile, 'username' | 'total_score'>>();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/dashboard" className="nav-logo">
            Числ<span>и</span>тель
          </Link>
          <div className="nav-links">
            <Link href="/lectures" className="nav-link">Лекции</Link>
            <Link href="/diagnostic" className="nav-link">Диагностика</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/dashboard" className="nav-score">
              {profile?.username ?? 'Кабинет'}
              <span className="nav-score-num">{profile?.total_score ?? 0} б</span>
            </Link>
            <LogoutButton className="btn btn-outline btn-sm" />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
