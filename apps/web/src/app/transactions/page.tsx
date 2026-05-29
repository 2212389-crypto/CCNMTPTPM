import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import TransactionsModule from '@/components/transactions-module';

export default async function TransactionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: accountsData } = (await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })) as { data: Database['public']['Tables']['accounts']['Row'][] | null };

  const { data: transactionsData } = (await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })) as { data: Database['public']['Tables']['transactions']['Row'][] | null };

  return <TransactionsModule userId={session.user.id} accounts={accountsData ?? []} initialTransactions={transactionsData ?? []} />;
}
