import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import BudgetModule from '@/components/budget-module';

export default async function BudgetPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: budgetsData } = (await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })) as { data: Database['public']['Tables']['budgets']['Row'][] | null };

  const { data: transactionsData } = (await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })) as { data: Database['public']['Tables']['transactions']['Row'][] | null };

  return <BudgetModule userId={session.user.id} budgets={budgetsData ?? []} transactions={transactionsData ?? []} />;
}
