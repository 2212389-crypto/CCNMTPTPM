import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ProfileSignOut from '@/components/profile-signout';
import { AppIcon } from '@/components/icons';
import { formatDateShort, formatVietnameseDate } from '@/lib/format';
import { getSessionRole } from '@/lib/auth';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const role = getSessionRole(session);
  const joinedAt = session.user.created_at ?? new Date().toISOString();

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6c63ff,#378add)] text-2xl font-bold text-white">
              {session.user.email?.slice(0, 2).toUpperCase() ?? 'EM'}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Hồ sơ</p>
              <h1 className="mt-2 text-[28px] font-bold text-[var(--text-main)]">Thông tin tài khoản</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Cập nhật giao diện hồ sơ theo cùng một ngôn ngữ thiết kế với toàn bộ ứng dụng.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#eeedfe] px-4 py-2 text-sm font-semibold text-[#3c3489]">{role.toUpperCase()}</span>
            <span className="rounded-full bg-[#f1efe8] px-4 py-2 text-sm font-semibold text-[#5f5e5a]">Tham gia từ {formatDateShort(joinedAt)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Email', session.user.email ?? 'N/A'],
          ['User ID', session.user.id],
          ['Ngày tham gia', formatVietnameseDate(joinedAt)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-3 break-all text-[15px] font-semibold text-[var(--text-main)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Tùy chọn nhanh</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Trạng thái tài khoản</h2>
            </div>
            <AppIcon name="user" className="h-5 w-5 text-[#6c63ff]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'Thông tin cá nhân',
              'Bảo mật đăng nhập',
              'Thông báo hệ thống',
              'Xuất dữ liệu'
            ].map((item) => (
              <div key={item} className="rounded-[12px] border border-[var(--border)] bg-[#fafbff] px-4 py-3 text-sm text-[var(--text-main)]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Đăng xuất</p>
          <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-main)]">Kết thúc phiên</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Sử dụng nút bên dưới để thoát khỏi tài khoản hiện tại một cách an toàn.</p>
          <div className="mt-5">
            <ProfileSignOut />
          </div>
        </div>
      </section>
    </div>
  );
}
