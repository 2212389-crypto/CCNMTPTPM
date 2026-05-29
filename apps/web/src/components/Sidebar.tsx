'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/toast-provider';
import { AppIcon, type IconName } from '@/components/icons';
import { useRole } from '@/hooks/useRole';

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
  group: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard', group: 'TỔNG QUAN' },
  { href: '/accounts', label: 'Tài khoản', icon: 'wallet', group: 'QUẢN LÝ' },
  { href: '/transactions', label: 'Giao dịch', icon: 'exchange', group: 'QUẢN LÝ' },
  { href: '/reports', label: 'Báo cáo', icon: 'chart', group: 'PHÂN TÍCH' },
  { href: '/budgets', label: 'Ngân sách', icon: 'target', group: 'PHÂN TÍCH' },
  { href: '/admin', label: 'Quản trị hệ thống', icon: 'shield', group: 'ADMIN', adminOnly: true },
  { href: '/profile', label: 'Hồ sơ', icon: 'user', group: 'CUỐI' },
  { href: '/settings', label: 'Cài đặt', icon: 'settings', group: 'CUỐI' }
];

function initials(email?: string | null) {
  if (!email) return 'EM';
  return email.slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useRole();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ type: 'success', title: 'Đã đăng xuất', description: 'Phiên làm việc của bạn đã kết thúc.' });
    router.push('/login');
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 border-r border-[var(--border)] bg-[var(--bg-card)] md:flex lg:w-60">
        <div className="flex w-full flex-col">
          <div className="border-b border-[var(--border)] p-4 lg:p-5">
            <Link href="/" className="flex items-start gap-3 text-[var(--text-main)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6c63ff,#378add)] text-white shadow-[var(--shadow-card)]">
                <span className="text-sm font-bold">EM</span>
              </div>
              <div className="hidden lg:block">
                <div className="text-[16px] font-bold leading-5">Expense Manager</div>
                <div className="mt-1 text-[11px] text-[var(--text-muted)]">Quản lý tài chính thông minh</div>
              </div>
            </Link>
          </div>

          <div className="border-b border-[var(--border)] p-4 lg:p-5">
            <div className="flex items-center gap-3 lg:items-start">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6c63ff,#378add)] text-sm font-semibold text-white">
                {initials(user?.email)}
              </div>
              <div className="min-w-0 flex-1 hidden lg:block">
                <p className="truncate text-[15px] font-medium text-[var(--text-main)]">{user?.user_metadata?.full_name ?? user?.email ?? 'Khách'}</p>
                <p className="truncate text-[12px] text-[var(--text-muted)]">{user?.email ?? 'Chưa đăng nhập'}</p>
              </div>
              {isAdmin ? <span className="hidden rounded-full bg-[#fef3c7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#92400e] lg:inline-flex">ADMIN</span> : null}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
            {['TỔNG QUAN', 'QUẢN LÝ', 'PHÂN TÍCH', 'ADMIN', 'CUỐI'].map((group) => {
              const items = navItems.filter((item) => item.group === group && (!item.adminOnly || isAdmin));
              if (items.length === 0) return null;

              return (
                <div key={group} className="mb-5">
                  <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] lg:block">{group}</p>
                  <div className={cn(group === 'ADMIN' && 'rounded-[12px] border-l-2 border-[#ef9f27] bg-[#fffbeb] p-2')}>
                    {items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'group mb-1 flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm transition-colors',
                            active ? 'border-l-[3px] border-l-[#6c63ff] bg-[#eeedfe] font-medium text-[#3c3489]' : 'text-[var(--text-main)] hover:bg-[#f5f5f5]',
                            'md:justify-center md:px-0 lg:justify-start lg:px-3'
                          )}
                        >
                          <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
                          <span className="hidden lg:inline">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] p-2 lg:p-3">
            <div className="space-y-1">
              <Link href="/settings" className="flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-[var(--text-main)] hover:bg-[#f5f5f5] md:justify-center lg:justify-start">
                <AppIcon name="settings" className="h-5 w-5" />
                <span className="hidden lg:inline">Cài đặt</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-[var(--text-main)] hover:bg-[#f5f5f5] md:justify-center lg:justify-start">
                <AppIcon name="user" className="h-5 w-5" />
                <span className="hidden lg:inline">Hồ sơ</span>
              </Link>
              <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-[#e24b4a] hover:bg-[#fef2f2] md:justify-center lg:justify-start">
                <AppIcon name="logout" className="h-5 w-5" />
                <span className="hidden lg:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-1 text-[11px] font-medium text-[var(--text-muted)]">
          {[
            { href: '/', label: 'Dashboard', icon: 'dashboard' as const },
            { href: '/transactions', label: 'GD', icon: 'exchange' as const },
            { href: '/reports', label: 'Báo cáo', icon: 'chart' as const },
            { href: '/profile', label: 'Hồ sơ', icon: 'user' as const },
            { href: '/accounts', label: 'Tài khoản', icon: 'wallet' as const }
          ].map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={cn('flex flex-col items-center gap-1 rounded-[12px] px-2 py-2', active && 'bg-[#eeedfe] text-[#3c3489]')}>
                <AppIcon name={icon} className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}