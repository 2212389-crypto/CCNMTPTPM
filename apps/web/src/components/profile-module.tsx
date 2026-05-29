'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase-client';
import { fmtCurrency, fmtDate } from '@/lib/expense';
import Avatar from '@/components/avatar';
import { AppIcon } from '@/components/icons';
import { EmptyState, Spinner } from '@/components/ui-kit';
import Button from '@/components/button';
import { toast } from 'sonner';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type BudgetRow = Database['public']['Tables']['budgets']['Row'];

type TabKey = 'overview' | 'edit' | 'data';

export default function ProfileModule({
  userId,
  email,
  initialProfile,
  accounts,
  transactions,
  budgets
}: {
  userId: string;
  email: string;
  initialProfile: ProfileRow | null;
  accounts: AccountRow[];
  transactions: TransactionRow[];
  budgets: BudgetRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('overview');
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? '');
  const [bio, setBio] = useState(initialProfile?.bio ?? '');
  const [currency, setCurrency] = useState(initialProfile?.currency ?? 'VND');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0), [accounts]);
  const transactionCount = transactions.length;
  const expenseCount = transactions.filter((transaction) => transaction.type === 'expense').length;
  const budgetCount = budgets.length;

  const previewUrl = file ? URL.createObjectURL(file) : avatarUrl;

  const saveProfile = async () => {
    setSaving(true);
    try {
      let nextAvatar = avatarUrl;
      if (file) {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        nextAvatar = data.publicUrl;
      }

      const payload = {
        user_id: userId,
        display_name: displayName.trim(),
        email,
        bio: bio.trim(),
        currency: currency.trim().toUpperCase(),
        avatar_url: nextAvatar
      };

      const { data, error } = await (supabase.from('profiles') as any).upsert(payload as any).select('*').single();
      if (error) throw error;
      setProfile(data as ProfileRow);
      setAvatarUrl(nextAvatar);
      setFile(null);
      toast.success('Đã cập nhật hồ sơ.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Số dư', value: fmtCurrency(totalBalance, profile?.currency ?? currency) },
    { label: 'Giao dịch', value: String(transactionCount) },
    { label: 'Chi tiêu', value: String(expenseCount) },
    { label: 'Ngân sách', value: String(budgetCount) }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(245,158,11,0.08))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={displayName || email} imageUrl={avatarUrl || undefined} size={72} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f766e]">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-main)]">{displayName || email}</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/70 bg-white/80 p-4 text-center backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
        <div className="flex flex-wrap gap-2">
          {([
            ['overview', 'Tổng quan'],
            ['edit', 'Chỉnh sửa hồ sơ'],
            ['data', 'Dữ liệu']
          ] as Array<[TabKey, string]>).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm transition ${tab === key ? 'font-medium border-b-2 border-black text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'overview' ? (
        <section className="grid gap-4 xl:grid-cols-3">
          <Card title="Hồ sơ" icon={<AppIcon name="user" className="h-5 w-5" />}>
            <p className="text-sm text-[var(--text-muted)]">Tên hiển thị: <span className="font-semibold text-[var(--text-main)]">{displayName || 'Chưa đặt'}</span></p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Ghi chú: {bio || 'Chưa có mô tả'}</p>
          </Card>
          <Card title="Tài khoản" icon={<AppIcon name="wallet" className="h-5 w-5" />}>
            <p className="text-sm text-[var(--text-muted)]">{accounts.length} tài khoản được kết nối</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{fmtCurrency(totalBalance, profile?.currency ?? currency)}</p>
          </Card>
          <Card title="Hoạt động" icon={<AppIcon name="chart" className="h-5 w-5" />}>
            <p className="text-sm text-[var(--text-muted)]">{transactions.length} giao dịch · {budgets.length} ngân sách</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Cập nhật lần cuối: {profile?.updated_at ? fmtDate(profile.updated_at) : 'Chưa cập nhật'}</p>
          </Card>
        </section>
      ) : null}

      {tab === 'edit' ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">Thông tin hồ sơ</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[var(--text-main)]">Tên hiển thị</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Tên của bạn" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[var(--text-main)]">Email</span>
                <input value={email} readOnly className="w-full rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--text-main)]">Tiền tệ</span>
                <input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} placeholder="VND" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--text-main)]">Ảnh đại diện</span>
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[var(--text-main)]">Giới thiệu</span>
                <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} placeholder="Thêm mô tả ngắn về bạn" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10" />
              </label>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="primary" onClick={saveProfile} disabled={saving} className="inline-flex items-center gap-2 px-5 py-3">
                {saving ? <Spinner /> : null}
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">Xem trước</h2>
            <div className="mt-5 rounded-[24px] border border-dashed border-[var(--border)] bg-slate-50 p-5 text-center">
              <div className="mx-auto flex justify-center">
                <Avatar name={displayName || email} imageUrl={previewUrl || undefined} size={96} />
              </div>
              <p className="mt-4 text-xl font-semibold text-[var(--text-main)]">{displayName || email}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{bio || 'Chưa có mô tả.'}</p>
              <p className="mt-4 text-sm text-[var(--text-muted)]">Ảnh sẽ được lưu vào bucket `avatars` nếu cấu hình có sẵn.</p>
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'data' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SmallStat label="Tài khoản" value={String(accounts.length)} />
          <SmallStat label="Giao dịch" value={String(transactions.length)} />
          <SmallStat label="Ngân sách" value={String(budgets.length)} />
          <SmallStat label="Số dư" value={fmtCurrency(totalBalance, profile?.currency ?? currency)} />
        </section>
      ) : null}

      {!profile && tab === 'overview' ? (
        <EmptyState title="Hồ sơ chưa được tạo" description="Mở tab chỉnh sửa để tạo bản ghi hồ sơ đầu tiên cho tài khoản này." icon={<AppIcon name="user" className="h-7 w-7" />} />
      ) : null}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5 xl:col-span-1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div>
        <h2 className="text-lg font-semibold text-[var(--text-main)]">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}
