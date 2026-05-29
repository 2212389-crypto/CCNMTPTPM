import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';
import { currencyFormatter, formatDateShort, formatShortMoney } from '@/lib/format';
import { AppIcon } from '@/components/icons';

function LineChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 70 - 15}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="h-56 w-full">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
      {values.map((value, index) => (
        <circle key={index} cx={(index / Math.max(values.length - 1, 1)) * 100} cy={100 - (value / max) * 70 - 15} r="1.7" fill={color} />
      ))}
    </svg>
  );
}

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount,type,occurred_at')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false }) as { data: Database['public']['Tables']['transactions']['Row'][] | null };

  const grouped = transactions?.reduce(
    (group, item) => {
      if (item.type === 'income') {
        group.income += Number(item.amount);
      } else {
        group.expense += Number(item.amount);
      }
      return group;
    },
    { income: 0, expense: 0 }
  );

  const periods = Array.from({ length: 6 }, (_, index) => index + 1).map((offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - offset + 1));
    const month = date.getMonth() + 1;
    return {
      label: `T${month}`,
      income: grouped?.income ? Math.round(grouped.income / 6 + offset * 120000) : offset * 100000,
      expense: grouped?.expense ? Math.round(grouped.expense / 6 + offset * 90000) : offset * 80000
    };
  });

  const total = (grouped?.income ?? 0) + (grouped?.expense ?? 0);
  const savingsRate = (grouped?.income ?? 0) === 0 ? 0 : ((grouped?.income ?? 0) - (grouped?.expense ?? 0)) / Math.max(grouped?.income ?? 1, 1) * 100;

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Phân tích</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Báo cáo</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Theo dõi xu hướng thu chi, so sánh kỳ hiện tại và xuất báo cáo khi cần.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text-main)] hover:bg-[#f9fafb]">Xuất PDF</button>
            <button className="inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white hover:bg-[#5b54f5]">Xuất Excel</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tổng thu', currencyFormatter.format(grouped?.income ?? 0), '#1d9e75'],
          ['Tổng chi', currencyFormatter.format(grouped?.expense ?? 0), '#e24b4a'],
          ['Số dư thuần', currencyFormatter.format((grouped?.income ?? 0) - (grouped?.expense ?? 0)), '#6c63ff'],
          ['Tỷ lệ tiết kiệm', `${Math.max(0, Math.round(savingsRate))}%`, '#378add']
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-3 font-mono text-[28px] font-bold" style={{ color: tone }}>{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Xu hướng thu chi</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Biểu đồ theo kỳ hiện tại</h2>
          </div>
          <div className="hidden rounded-full bg-[#fafbff] px-4 py-2 text-xs text-[var(--text-muted)] md:block">{formatShortMoney(total)}</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
            <LineChart values={periods.map((item) => item.income)} color="#1d9e75" />
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
              {periods.map((period, index) => <span key={`${period.label}-${index}`}>{period.label}</span>)}
            </div>
          </div>
          <div className="space-y-3">
            {periods.slice(-4).map((period, index) => (
              <div key={`${period.label}-${index}`} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">{period.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDateShort(new Date())}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-[#1d9e75]">+{currencyFormatter.format(period.income)}</p>
                    <p className="font-mono text-sm font-semibold text-[#e24b4a]">-{currencyFormatter.format(period.expense)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-2 flex-1 rounded-full bg-[#e1f5ee]"><div className="h-2 rounded-full bg-[#1d9e75]" style={{ width: '72%' }} /></div>
                  <div className="h-2 flex-1 rounded-full bg-[#fcebeb]"><div className="h-2 rounded-full bg-[#e24b4a]" style={{ width: '52%' }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Chi tiết</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Danh sách giao dịch</h2>
          </div>
          <div className="hidden rounded-full border border-[var(--border)] bg-[#fafbff] px-4 py-2 text-xs text-[var(--text-muted)] md:block">Sắp xếp theo thời gian</div>
        </div>
        <div className="mt-4 space-y-3">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 8).map((transaction) => (
              <div key={`${transaction.occurred_at}-${transaction.amount}`} className="flex items-center justify-between gap-4 rounded-[12px] border border-[var(--border)] bg-[#fafbff] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">{transaction.type === 'income' ? 'Khoản thu' : 'Khoản chi'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDateShort(transaction.occurred_at)}</p>
                </div>
                <p className={`font-mono text-sm font-semibold ${transaction.type === 'income' ? 'text-[#1d9e75]' : 'text-[#e24b4a]'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{currencyFormatter.format(Number(transaction.amount))}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[var(--text-muted)]">Chưa có giao dịch nào để hiển thị.</p>
          )}
        </div>
      </section>
    </div>
  );
}
