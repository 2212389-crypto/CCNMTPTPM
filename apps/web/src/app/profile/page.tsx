import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import ProfileModule from '@/components/profile-module';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profileData } = (await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle()) as { data: Database['public']['Tables']['profiles']['Row'] | null };
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
  const { data: budgetsData } = (await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })) as { data: Database['public']['Tables']['budgets']['Row'][] | null };

  return (
    <ProfileModule
      userId={session.user.id}
      email={session.user.email ?? ''}
      initialProfile={profileData ?? null}
      accounts={accountsData ?? []}
      transactions={transactionsData ?? []}
      budgets={budgetsData ?? []}
    />
  );
}
