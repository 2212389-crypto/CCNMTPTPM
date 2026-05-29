import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AppIcon } from '@/components/icons';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Cấu hình</p>
            <h1 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Cài đặt</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Không thay đổi logic nền tảng, chỉ là nơi gom các tuỳ chọn UI trong tương lai.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eeedfe] px-4 py-2 text-sm font-semibold text-[#3c3489]">
            <AppIcon name="settings" className="h-4 w-4" /> Preference center
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Giao diện sáng/tối', 'Đơn vị tiền tệ', 'Thông báo', 'Ngôn ngữ', 'Nhắc nhở', 'Kết nối'].map((item) => (
          <div key={item} className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[15px] font-semibold text-[var(--text-main)]">{item}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Tuỳ chọn giao diện dành cho phiên bản hoàn thiện tiếp theo.</p>
          </div>
        ))}
      </section>
    </div>
  );
}