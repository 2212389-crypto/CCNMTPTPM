import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';
import { AppIcon } from '@/components/icons';
import { currencyFormatter } from '@/lib/format';

export default async function BudgetsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false }) as { data: Database['public']['Tables']['budgets']['Row'][] | null };

  const items = budgets ?? [];
  const totalLimit = items.reduce((sum, budget) => sum + Number(budget.limit_amount), 0);
  const totalSpent = items.reduce((sum, budget) => sum + Number(budget.spent_amount), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Phân tích</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Ngân sách tháng này</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Theo dõi giới hạn chi tiêu và trạng thái từng danh mục.</p>
          </div>
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white hover:bg-[#5b54f5]">+ Đặt ngân sách</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Tổng ngân sách đặt', currencyFormatter.format(totalLimit)],
            ['Đã chi', currencyFormatter.format(totalSpent)],
            ['Còn lại', currencyFormatter.format(Math.max(0, totalLimit - totalSpent))]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 font-mono text-[22px] font-bold text-[var(--text-main)]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((budget) => {
            const spent = Number(budget.spent_amount);
            const limit = Number(budget.limit_amount);
            const pct = limit === 0 ? 0 : (spent / limit) * 100;
            const color = pct > 100 ? '#e24b4a' : pct > 80 ? '#ef9f27' : '#1d9e75';
            return (
              <div key={budget.id} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eeedfe] text-[#6c63ff]">
                    <AppIcon name="target" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--text-main)]">{budget.category ?? 'Danh mục khác'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{budget.scope}</p>
                  </div>
                </div>
                <p className="mt-4 font-mono text-[18px] font-bold text-[var(--text-main)]">{currencyFormatter.format(spent)} / {currencyFormatter.format(limit)}</p>
                <div className="mt-3 h-2 rounded-full bg-[#e8ecf0]">
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{Math.round(pct)}%</span>
                  {pct > 100 ? <span className="rounded-full bg-[#fef2f2] px-3 py-1 font-semibold text-[#b42318]">Vượt ngân sách!</span> : pct > 80 ? <span className="rounded-full bg-[#fffbeb] px-3 py-1 font-semibold text-[#92400e]">Sắp hết ngân sách</span> : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-white p-8 text-center text-[var(--text-muted)] shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eeedfe] text-[#6c63ff]"><AppIcon name="target" className="h-8 w-8" /></div>
            <p className="mt-4 text-lg font-semibold text-[var(--text-main)]">Chưa có ngân sách</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Đặt một ngân sách đầu tiên để theo dõi chi tiêu theo danh mục.</p>
          </div>
        )}
      </section>
    </div>
  );
}