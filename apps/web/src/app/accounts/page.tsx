import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import AccountsModule from '@/components/accounts-module';

export default async function AccountsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data } = (await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })) as { data: Database['public']['Tables']['accounts']['Row'][] | null };

  return <AccountsModule userId={session.user.id} initialAccounts={data ?? []} />;
}
