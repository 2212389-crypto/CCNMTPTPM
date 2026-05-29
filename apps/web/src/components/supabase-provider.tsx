'use client';

import type { Session } from '@supabase/supabase-js';

export default function SupabaseProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return <>{children}</>;
}
