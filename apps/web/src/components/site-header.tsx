'use client';

import AppShell from '@/components/app-shell';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/auth';

export default function SiteHeader({ session, role, children }: { session: Session | null; role: UserRole; children: React.ReactNode }) {
  return <AppShell session={session} role={role}>{children}</AppShell>;
}
