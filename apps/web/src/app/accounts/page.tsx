import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';
import AccountForm from '@/components/account-form';
import AccountRow from '@/components/account-row';
import { currencyFormatter, formatShortMoney } from '@/lib/format';
import { AppIcon } from '@/components/icons';

export default async function AccountsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false }) as { data: Database['public']['Tables']['accounts']['Row'][] | null };

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) ?? 0;
  const accountCount = accounts?.length ?? 0;
  const averageBalance = accountCount > 0 ? totalBalance / accountCount : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Quản lý</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Quản lý tài khoản</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Tạo, sửa và xoá tài khoản theo đúng nhu cầu quản lý dòng tiền.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eeedfe] px-4 py-2 text-sm font-semibold text-[#3c3489]">
            <AppIcon name="wallet" className="h-4 w-4" /> + Tạo tài khoản
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Số tài khoản', accountCount.toString()],
            ['Tổng số dư', currencyFormatter.format(totalBalance)],
            ['Trung bình', currencyFormatter.format(averageBalance)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 font-mono text-[22px] font-bold text-[var(--text-main)]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <AccountForm userId={session.user.id} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => <AccountRow key={account.id} account={account} />)
        ) : (
          <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-white p-8 text-center text-[var(--text-muted)] shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eeedfe] text-[#6c63ff]">
              <AppIcon name="wallet" className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-semibold text-[var(--text-main)]">Chưa có tài khoản nào</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Hãy tạo một tài khoản mới để bắt đầu ghi nhận số dư.</p>
          </div>
        )}
      </section>
    </div>
  );
}
