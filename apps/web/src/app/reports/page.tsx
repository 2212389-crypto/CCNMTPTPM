import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import ReportsModule from '@/components/reports-module';

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data } = (await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })) as { data: Database['public']['Tables']['transactions']['Row'][] | null };

  return <ReportsModule transactions={data ?? []} />;
}
