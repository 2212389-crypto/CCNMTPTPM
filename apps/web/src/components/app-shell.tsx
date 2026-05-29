'use client';

import { usePathname } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

const authRoutes = ['/login', '/register'];

export default function AppShell({ session, role, children }: { session: Session | null; role: UserRole; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return <main className="min-h-dvh px-4 py-8 sm:px-6 lg:px-8">{children}</main>;
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-page)]">
      <Sidebar />
      <main className="min-h-dvh pb-20 md:pb-6 md:pl-16 lg:pl-60">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}