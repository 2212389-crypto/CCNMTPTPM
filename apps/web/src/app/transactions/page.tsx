import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';
import TransactionForm from '@/components/transaction-form';
import { AppIcon } from '@/components/icons';
import { currencyFormatter, formatDateShort } from '@/lib/format';

export default async function TransactionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const accountsResponse = await supabase
    .from('accounts')
    .select('id,name')
    .eq('user_id', session.user.id) as { data: Array<Pick<Database['public']['Tables']['accounts']['Row'], 'id' | 'name'>> | null };

  const transactionsResponse = await supabase
    .from('transactions')
    .select('id,amount,type,note,occurred_at,account_id')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })
    .limit(10) as { data: Array<Pick<Database['public']['Tables']['transactions']['Row'], 'id' | 'amount' | 'type' | 'note' | 'occurred_at' | 'account_id'>> | null };

  const accounts = accountsResponse.data ?? [];
  const transactions = transactionsResponse.data ?? [];
  const totalIncome = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalExpense = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Quản lý</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Giao dịch</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Thêm và xem các khoản thu chi của bạn trong một giao diện rõ ràng hơn.</p>
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white hover:bg-[#5b54f5]">
            <AppIcon name="exchange" className="h-4 w-4" /> + Thêm giao dịch
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Tổng thu', currencyFormatter.format(totalIncome), '#1d9e75'],
            ['Tổng chi', currencyFormatter.format(totalExpense), '#e24b4a'],
            ['Số dư tạm tính', currencyFormatter.format(netBalance), '#6c63ff']
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 font-mono text-[22px] font-bold" style={{ color: tone }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TransactionForm userId={session.user.id} accounts={accounts} />

      <section className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Danh sách</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Giao dịch gần nhất</h2>
          </div>
          <div className="hidden rounded-full border border-[var(--border)] bg-[#fafbff] px-4 py-2 text-sm text-[var(--text-muted)] md:block">20 items / trang</div>
        </div>
        <div className="mt-4 overflow-hidden rounded-[12px] border border-[var(--border)]">
          {transactions.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col gap-3 bg-white p-4 transition hover:bg-[#f9fafb] md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${transaction.type === 'income' ? 'bg-[#e1f5ee] text-[#1d9e75]' : 'bg-[#fcebeb] text-[#e24b4a]'}`}>
                      <AppIcon name={transaction.type === 'income' ? 'chart' : 'exchange'} className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--text-main)]">{transaction.type === 'income' ? 'Khoản thu' : 'Khoản chi'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{transaction.note ?? 'Không có ghi chú'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 md:justify-end">
                    <p className="text-sm text-[var(--text-muted)]">{formatDateShort(transaction.occurred_at)}</p>
                    <p className={`font-mono text-[15px] font-semibold ${transaction.type === 'income' ? 'text-[#1d9e75]' : 'text-[#e24b4a]'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{currencyFormatter.format(Number(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-muted)]">Không có giao dịch nào.</div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#fafbff] px-4 py-3 text-sm">
          <span className="text-[#1d9e75]">Tổng thu: +{currencyFormatter.format(totalIncome)}</span>
          <span className="text-[#e24b4a]">Tổng chi: -{currencyFormatter.format(totalExpense)}</span>
          <span className="font-semibold text-[var(--text-main)]">Số dư: {currencyFormatter.format(netBalance)}</span>
        </div>
      </section>
    </div>
  );
}
