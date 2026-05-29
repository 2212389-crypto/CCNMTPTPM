import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createServerAdminSupabaseClient } from '@/lib/supabase-admin';
import { getSessionRole } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import RedirectToast from '@/components/redirect-toast';
import { AppIcon } from '@/components/icons';
import { currencyFormatter, formatDateShort, formatRelativeTime } from '@/lib/format';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];
type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

function uniqueUserIds(ids: Array<string | null | undefined>) {
  return Array.from(new Set(ids.filter(Boolean))) as string[];
}

export default async function AdminDashboardPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { session }
  } = await authClient.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  if (getSessionRole(session) !== 'admin') {
    return <RedirectToast href="/" title="Không có quyền" description="Bạn không có quyền truy cập trang quản trị." />;
  }

  const adminClient = createServerAdminSupabaseClient();

  const [accountsResponse, transactionsResponse, userRolesResponse, budgetsResponse, notificationsResponse, activityLogsResponse] = await Promise.all([
    adminClient.from('accounts').select('id,user_id,name,type,balance,currency,created_at'),
    adminClient.from('transactions').select('id,user_id,account_id,amount,type,note,occurred_at,created_at'),
    adminClient.from('user_roles').select('user_id,email,role,is_locked,created_at,updated_at'),
    adminClient.from('budgets').select('id,user_id,category,scope,limit_amount,spent_amount,threshold_70,threshold_90,threshold_100,start_date,end_date,created_at,updated_at'),
    adminClient.from('notifications').select('id,user_id,title,message,type,read_at,created_at'),
    adminClient.from('activity_logs').select('id,actor_user_id,target_user_id,action,entity_type,entity_id,metadata,created_at').order('created_at', { ascending: false }).limit(8)
  ]);

  const accounts = accountsResponse.data ?? [];
  const transactions = transactionsResponse.data ?? [];
  const userRoles = (userRolesResponse.data ?? []) as UserRoleRow[];
  const budgets = (budgetsResponse.data ?? []) as BudgetRow[];
  const notifications = (notificationsResponse.data ?? []) as NotificationRow[];
  const activityLogs = (activityLogsResponse.data ?? []) as ActivityLogRow[];
  const accountUserIds = uniqueUserIds(accounts.map((account) => account.user_id));
  const transactionUserIds = uniqueUserIds(transactions.map((transaction) => transaction.user_id));
  const budgetUserIds = uniqueUserIds(budgets.map((budget) => budget.user_id));
  const lockedUsers = userRoles.filter((userRole) => userRole.is_locked).length;
  const activeToday = uniqueUserIds(
    transactions.filter((transaction) => new Date(transaction.occurred_at).toDateString() === new Date().toDateString()).map((transaction) => transaction.user_id)
  );
  const totalUsers = uniqueUserIds([...accountUserIds, ...transactionUserIds, ...budgetUserIds, ...userRoles.map((userRole) => userRole.user_id)]).length;
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalIncome = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalExpense = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const unreadNotifications = notifications.filter((notification) => !notification.read_at).length;
  const topUsers = uniqueUserIds(transactions.map((transaction) => transaction.user_id))
    .map((userId) => ({
      userId,
      transactionCount: transactions.filter((transaction) => transaction.user_id === userId).length,
      totalSpent: transactions
        .filter((transaction) => transaction.user_id === userId && transaction.type === 'expense')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 8);

  const latestActivityLogs = activityLogs;
  const readOnlyUsers = userRoles.filter((userRole) => userRole.role === 'user').length;

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#f6d860] bg-[#fffbeb] p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#ef9f27]">Admin Dashboard</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Quản trị hệ thống</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Chỉ tài khoản ADMIN mới truy cập được trang này.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#92400e] shadow-sm">
            <AppIcon name="shield" className="h-4 w-4" /> ADMIN DASHBOARD
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tổng user', totalUsers],
          ['User active hôm nay', activeToday.length],
          ['Người bị khoá', lockedUsers],
          ['Thông báo chưa đọc', unreadNotifications]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-3 text-[28px] font-bold text-[var(--text-main)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tổng số dư hệ thống', currencyFormatter.format(totalBalance), '#6c63ff'],
          ['Tổng ngân sách', budgets.length.toString(), '#ef9f27'],
          ['Thu / Chi hệ thống', `${currencyFormatter.format(totalIncome)} / ${currencyFormatter.format(totalExpense)}`, '#1d9e75'],
          ['Nhật ký hoạt động', activityLogs.length.toString(), '#378add']
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-3 break-words font-mono text-[20px] font-bold" style={{ color: tone }}>{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Người dùng</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Top user theo chi tiêu</h2>
            </div>
            <div className="rounded-full bg-[#fffbeb] px-3 py-1 text-xs font-semibold text-[#92400e]">{readOnlyUsers} user</div>
          </div>
          <div className="mt-4 space-y-3">
            {topUsers.length > 0 ? (
              topUsers.map((item) => (
                <div key={item.userId} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeedfe] text-sm font-bold text-[#3c3489]">
                      {item.userId.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-semibold text-[var(--text-main)]">{item.userId}</p>
                      <p className="text-xs text-[var(--text-muted)]">Số giao dịch: {item.transactionCount}</p>
                    </div>
                    <span className="rounded-full bg-[#f1efe8] px-3 py-1 text-xs font-semibold text-[#5f5e5a]">USER</span>
                  </div>
                  <p className="mt-3 font-mono text-[18px] font-bold text-[#e24b4a]">{currencyFormatter.format(item.totalSpent)}</p>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)]">Chưa có dữ liệu.</p>
            )}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Hành động</p>
            <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Nhật ký hoạt động gần nhất</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Dữ liệu lấy trực tiếp từ bảng activity_logs để theo dõi thao tác quản trị.</p>
          </div>
          <div className="mt-4 space-y-3">
            {latestActivityLogs.length > 0 ? (
              latestActivityLogs.map((log) => (
                <div key={log.id} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffbeb] text-[#ef9f27]">
                      <AppIcon name="shield" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-semibold text-[var(--text-main)]">{log.action} • {log.entity_type}</p>
                      <p className="text-xs text-[var(--text-muted)]">Actor: {log.actor_user_id ?? 'system'} • Target: {log.target_user_id ?? 'n/a'}</p>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">{formatRelativeTime(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)]">Chưa có activity log nào.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[12px] border border-dashed border-[#efd69a] bg-[#fffbeb] p-6 text-[#92400e] shadow-[var(--shadow-card)]">
        <h2 className="text-[18px] font-semibold">Ghi chú triển khai quyền</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>ADMIN được xác định theo email <span className="font-semibold">2212389@dlu.edu.vn</span>.</li>
          <li>USER không thấy menu Admin Dashboard và được redirect kèm toast nếu truy cập trực tiếp.</li>
          <li>Các thao tác quản trị nâng cao dùng service role server-side, không lộ ra client.</li>
        </ul>
      </section>
    </div>
  );
}
