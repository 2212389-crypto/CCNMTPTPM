import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/database.types';
import TransactionsModule from '@/components/transactions-module';

export default async function TransactionsPage() {
  try {
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
  } catch (error) {
    console.error('Transactions page failed to load:', error);

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-[28px] border border-[var(--border)] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563eb]">Expense Manager</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-main)]">Không tải được trang giao dịch</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Hệ thống đang gặp lỗi khi đọc dữ liệu giao dịch. Hãy kiểm tra lại biến môi trường Supabase, kết nối database hoặc thử tải lại trang sau vài phút.
          </p>
        </div>
      </div>
    );
  }
}
