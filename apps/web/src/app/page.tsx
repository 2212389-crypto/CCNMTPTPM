import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerAdminSupabaseClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSessionRole } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { AppIcon } from '@/components/icons';
import { currencyFormatter, formatDateShort, formatRelativeTime, formatShortMoney, formatVietnameseDate } from '@/lib/format';
import UnauthorizedToast from '@/components/UnauthorizedToast';

const uniqueIds = (values: Array<string | null | undefined>) => Array.from(new Set(values.filter(Boolean))) as string[];

const categoryPalette = [
  { label: 'Ăn uống', color: '#ef9f27' },
  { label: 'Di chuyển', color: '#378add' },
  { label: 'Mua sắm', color: '#d4537e' },
  { label: 'Giáo dục', color: '#7f77dd' },
  { label: 'Y tế', color: '#e24b4a' },
  { label: 'Giải trí', color: '#5dcaa5' },
  { label: 'Tiết kiệm', color: '#1d9e75' },
  { label: 'Hoá đơn', color: '#888780' },
  { label: 'Khác', color: '#b4b2a9' }
];

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function percent(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 80 - 10}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full">
      <polyline fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}

function ProgressRing({ value }: { value: number }) {
  const size = 80;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-20 w-20">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eeedfe" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#6c63ff" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={dash} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="48%" textAnchor="middle" className="fill-[var(--text-main)] text-[16px] font-bold">{Math.round(value)}%</text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-[var(--text-muted)] text-[8px] uppercase tracking-[0.1em]">Goal</text>
    </svg>
  );
}

function DonutChart({ items }: { items: Array<{ label: string; value: number; color: string }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const size = 220;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let dashOffset = 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[220px] w-[220px]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {items.map((item) => {
          const dash = total === 0 ? circumference : (item.value / total) * circumference;
          const element = (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          dashOffset += dash;
          return element;
        })}
        <text x="50%" y="48%" textAnchor="middle" className="fill-[var(--text-main)] text-[17px] font-bold">Chi tiêu</text>
        <text x="50%" y="62%" textAnchor="middle" className="fill-[var(--text-muted)] text-[8px] uppercase tracking-[0.1em]">{formatShortMoney(total)}</text>
      </svg>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-[12px] border border-[var(--border)] bg-[#fafbff] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{percent(item.value, total)}%</p>
              </div>
            </div>
            <p className="font-mono text-sm font-medium text-[var(--text-main)]">{currencyFormatter.format(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupedMonthlyBars({ income, expense }: { income: number[]; expense: number[] }) {
  const max = Math.max(...income, ...expense, 1);
  return (
    <div className="grid grid-cols-6 gap-3">
      {income.map((value, index) => (
        <div key={index} className="flex flex-col items-center gap-2">
          <div className="flex h-44 items-end gap-1 rounded-[12px] border border-[var(--border)] bg-[#fafbff] px-2 pb-2 pt-3">
            <div className="w-4 rounded-full bg-[#1d9e75]" style={{ height: `${(value / max) * 100}%` }} />
            <div className="w-4 rounded-full bg-[#e24b4a]" style={{ height: `${(expense[index] / max) * 100}%` }} />
          </div>
          <p className="text-[11px] font-medium text-[var(--text-muted)]">{['T1', 'T2', 'T3', 'T4', 'T5', 'T6'][index]}</p>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage(props: any) {
  const { searchParams } = props ?? {};
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  const role = getSessionRole(session);

  const adminOverviewPromise =
    role === 'admin'
      ? (async () => {
          const adminSupabase = createServerAdminSupabaseClient();
          const [allAccountsResult, allTransactionsResult] = await Promise.all([
            adminSupabase.from('accounts').select('id,user_id,balance,currency,created_at') as PromiseLike<{
              data: Database['public']['Tables']['accounts']['Row'][] | null;
            }>,
            adminSupabase.from('transactions').select('id,user_id,amount,type,occurred_at,created_at') as PromiseLike<{
              data: Database['public']['Tables']['transactions']['Row'][] | null;
            }>
          ]);

          const allAccounts = (allAccountsResult.data ?? []) as Database['public']['Tables']['accounts']['Row'][];
          const allTransactions = (allTransactionsResult.data ?? []) as Database['public']['Tables']['transactions']['Row'][];
          const activeTodayUserIds = uniqueIds(
            allTransactions
              .filter((transaction) => new Date(transaction.occurred_at).toDateString() === new Date().toDateString())
              .map((transaction) => transaction.user_id)
          );

          const totalUsers = uniqueIds([
            ...allAccounts.map((account) => account.user_id),
            ...allTransactions.map((transaction) => transaction.user_id)
          ]).length;

          return {
            totalUsers,
            activeToday: activeTodayUserIds.length,
            totalSystemBalance: allAccounts.reduce((sum, account) => sum + Number(account.balance), 0),
            totalSystemIncome: allTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0),
            totalSystemExpense: allTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0)
          };
        })()
      : Promise.resolve(null);

  const accountsResult = await supabase
    .from('accounts')
    .select('id,name,type,balance,currency')
    .eq('user_id', session.user.id) as { data: Database['public']['Tables']['accounts']['Row'][] | null };

  const transactionsResult = await supabase
    .from('transactions')
    .select('id,amount,type,account_id,occurred_at')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })
    .limit(5) as { data: Database['public']['Tables']['transactions']['Row'][] | null };

  const accounts = accountsResult.data;
  const transactions = transactionsResult.data;
  const adminOverview = await adminOverviewPromise;
  const budgetResult = await supabase
    .from('budgets')
    .select('id,user_id,category,scope,limit_amount,spent_amount,threshold_70,threshold_90,threshold_100,start_date,end_date,created_at')
    .eq('user_id', session.user.id) as { data: Database['public']['Tables']['budgets']['Row'][] | null };
  const budgets = budgetResult.data ?? [];

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) ?? 0;
  const income = transactions?.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
  const expense = transactions?.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
  const savingsRate = income + expense === 0 ? 0 : (income - expense) / income * 100;

  const recentTransactions = transactions ?? [];
  const monthlyTrend = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - offset));
    const monthKey = getMonthKey(date);
    const monthTransactions = recentTransactions.filter((transaction) => getMonthKey(new Date(transaction.occurred_at)) === monthKey);
    return {
      label: monthKey,
      income: monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0),
      expense: monthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    };
  });

  const categoryItems = categoryPalette.map((item, index) => ({
    label: item.label,
    color: item.color,
    value: budgets[index]?.spent_amount ? Number(budgets[index].spent_amount) : Math.max(0, Math.round(expense / Math.max(categoryPalette.length - index, 1)))
  }));

  const topBudgets = budgets.slice(0, 5);
  const latestTransactions = recentTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <UnauthorizedToast enabled={searchParams?.error === 'unauthorized'} />
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6c63ff]">Dashboard</p>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-[var(--text-main)]">Xin chào, {session.user.user_metadata?.full_name ?? session.user.email ?? 'bạn'}! 👋</h1>
            <p className="mt-2 text-[14px] text-[var(--text-muted)]">{formatVietnameseDate(new Date())}</p>
          </div>
          <Link href="/transactions" className="inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white transition hover:bg-[#5b54f5]">
            + Thêm giao dịch
          </Link>
        </div>
        {role === 'admin' ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fef3c7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#92400e]">
            <AppIcon name="shield" className="h-4 w-4" /> Admin access enabled
          </div>
        ) : null}
      </section>

      {role === 'admin' && adminOverview ? (
        <section className="rounded-[12px] border border-[#f6d860] bg-[#fffbeb] p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#ef9f27]">ADMIN QUICK STATS</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Tổng quan hệ thống</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Các chỉ số này giúp ADMIN nhìn nhanh tình trạng toàn hệ thống trước khi đi vào trang quản trị chi tiết.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin" className="inline-flex h-11 items-center justify-center rounded-full bg-[#ef9f27] px-5 text-sm font-semibold text-white hover:bg-[#d98c1f]">
                Open Admin Dashboard
              </Link>
              <Link href="/reports" className="inline-flex h-11 items-center justify-center rounded-full border border-[#efd69a] bg-white px-5 text-sm font-semibold text-[#92400e] hover:bg-[#fff7e0]">
                View reports
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Total user', adminOverview.totalUsers.toString()],
              ['Active today', adminOverview.activeToday.toString()],
              ['Số dư hệ thống', currencyFormatter.format(adminOverview.totalSystemBalance)],
              ['Thu HT', currencyFormatter.format(adminOverview.totalSystemIncome)],
              ['Chi HT', currencyFormatter.format(adminOverview.totalSystemExpense)]
            ].map(([label, value], index) => (
              <div key={label} className="rounded-[12px] border border-[#f3e4b8] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
                <p className={index < 2 ? 'mt-3 text-[28px] font-bold text-[var(--text-main)]' : index === 3 ? 'mt-3 font-mono text-[20px] font-bold text-[#1d9e75]' : index === 4 ? 'mt-3 font-mono text-[20px] font-bold text-[#e24b4a]' : 'mt-3 font-mono text-[20px] font-bold text-[var(--text-main)]'}>{value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Số dư hiện tại', value: currencyFormatter.format(totalBalance), icon: 'wallet' as const, tone: 'bg-[#eeedfe] text-[#6c63ff]', helper: `${accounts?.length ?? 0} tài khoản` },
          { label: 'Thu tháng này', value: currencyFormatter.format(income), icon: 'chart' as const, tone: 'bg-[#e1f5ee] text-[#1d9e75]', helper: '+5.2% so tháng trước', spark: true },
          { label: 'Chi tháng này', value: currencyFormatter.format(expense), icon: 'exchange' as const, tone: 'bg-[#fcebeb] text-[#e24b4a]', helper: 'Kiểm soát từng khoản chi', spark: true },
          { label: 'Tiết kiệm', value: `${Math.max(0, Math.round(savingsRate))}%`, icon: 'target' as const, tone: 'bg-[#eeedfe] text-[#6c63ff]', helper: 'So với thu hiện tại', ring: true }
        ].map((item) => (
          <div key={item.label} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
                  <AppIcon name={item.icon} className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{item.label}</p>
                <p className="font-mono text-[32px] font-bold text-[var(--text-main)]">{item.value}</p>
                <p className="text-[13px] text-[var(--text-muted)]">{item.helper}</p>
              </div>
              {item.spark ? <div className="w-24"><MiniSparkline values={monthlyTrend.map((month) => (item.label.includes('Thu') ? month.income : month.expense))} color={item.label.includes('Thu') ? '#1d9e75' : '#e24b4a'} /></div> : null}
              {item.ring ? <ProgressRing value={Math.max(0, Math.min(100, savingsRate))} /> : null}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Chi tiêu theo danh mục</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Phân bổ ngân sách</h2>
            </div>
          </div>
          <div className="mt-6">
            {categoryItems.some((item) => item.value > 0) ? (
              <DonutChart items={categoryItems} />
            ) : (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[#fafbff] p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eeedfe] text-[#6c63ff]"><AppIcon name="wallet" className="h-8 w-8" /></div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-main)]">Chưa có dữ liệu</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Thêm tài khoản và giao dịch đầu tiên để bắt đầu.</p>
                <Link href="/transactions" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white">
                  Thêm giao dịch
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Thu vs Chi 6 tháng</p>
          <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Xu hướng dòng tiền</h2>
          <div className="mt-6">
            <GroupedMonthlyBars income={monthlyTrend.map((month) => month.income)} expense={monthlyTrend.map((month) => month.expense)} />
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#1d9e75]" /> Thu</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#e24b4a]" /> Chi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Giao dịch gần nhất</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">5 giao dịch mới nhất</h2>
            </div>
            <Link href="/transactions" className="text-sm font-semibold text-[#6c63ff] hover:text-[#4c46db]">Xem tất cả</Link>
          </div>
          <div className="mt-5 space-y-3">
            {latestTransactions.length > 0 ? (
              latestTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-[12px] border border-[var(--border)] bg-[#fafbff] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.type === 'income' ? 'bg-[#e1f5ee] text-[#1d9e75]' : 'bg-[#fcebeb] text-[#e24b4a]'}`}>
                      <AppIcon name={transaction.type === 'income' ? 'chart' : 'exchange'} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--text-main)]">{transaction.type === 'income' ? 'Khoản thu' : 'Khoản chi'}</p>
                        <span className="rounded-full bg-[#eeedfe] px-2 py-0.5 text-[11px] font-semibold text-[#3c3489]">{transaction.type}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(transaction.occurred_at)}</p>
                    </div>
                  </div>
                  <p className={`font-mono text-sm font-semibold ${transaction.type === 'income' ? 'text-[#1d9e75]' : 'text-[#e24b4a]'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{currencyFormatter.format(Number(transaction.amount))}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[#fafbff] p-6 text-center text-sm text-[var(--text-muted)]">Chưa có giao dịch nào.</div>
            )}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Ngân sách tháng này</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Theo danh mục</h2>
            </div>
            <Link href="/budgets" className="text-sm font-semibold text-[#6c63ff] hover:text-[#4c46db]">Quản lý ngân sách</Link>
          </div>
          <div className="mt-5 space-y-3">
            {topBudgets.length > 0 ? (
              topBudgets.map((budget, index) => {
                const spent = Number(budget.spent_amount);
                const limit = Number(budget.limit_amount);
                const pct = limit === 0 ? 0 : (spent / limit) * 100;
                const color = pct > 100 ? '#e24b4a' : pct > 80 ? '#ef9f27' : '#1d9e75';
                return (
                  <div key={budget.id} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">{budget.category ?? 'Ngân sách khác'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{currencyFormatter.format(spent)} / {currencyFormatter.format(limit)}</p>
                      </div>
                      {pct > 100 ? <span className="rounded-full bg-[#fef2f2] px-3 py-1 text-xs font-semibold text-[#b42318]">Vượt ngân sách!</span> : null}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#e8ecf0]">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[#fafbff] p-6 text-center">
                <p className="text-sm text-[var(--text-muted)]">Chưa có ngân sách nào. Hãy đặt ngân sách đầu tiên để theo dõi chi tiêu.</p>
                <Link href="/budgets" className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-5 text-sm font-semibold text-white">Đặt ngân sách</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
