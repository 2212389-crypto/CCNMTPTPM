'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase-client';
import { ACCOUNT_TYPES, fmtCurrency } from '@/lib/expense';
import { AppIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import { EmptyState, Modal, SkeletonCard, Spinner } from '@/components/ui-kit';
import Button from '@/components/button';
import IconButton from '@/components/icon-button';
import { toast } from 'sonner';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];

type AccountDraft = {
  name: string;
  type: string;
  balance: string;
  currency: string;
};

const emptyDraft: AccountDraft = {
  name: '',
  type: 'bank',
  balance: '',
  currency: 'VND'
};

function accountAccent(type: string) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.accent ?? 'bg-slate-500';
}

function accountLabel(type: string) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label ?? type;
}

function AccountModal({
  open,
  title,
  draft,
  errors,
  submitting,
  onClose,
  onChange,
  onSubmit
}: {
  open: boolean;
  title: string;
  draft: AccountDraft;
  errors: Partial<Record<keyof AccountDraft, string>>;
  submitting: boolean;
  onClose: () => void;
  onChange: (field: keyof AccountDraft, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Tên tài khoản</span>
          <input
            value={draft.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Ví dụ: Ví chính, MB Bank, Cash"
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.name ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#7c6cff] focus:ring-2 focus:ring-[#7c6cff]/10'}`}
          />
          {errors.name ? <p className="text-xs font-medium text-rose-600">{errors.name}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Loại tài khoản</span>
          <select
            value={draft.type}
            onChange={(event) => onChange('type', event.target.value)}
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.type ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#7c6cff] focus:ring-2 focus:ring-[#7c6cff]/10'}`}
          >
            {ACCOUNT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.type ? <p className="text-xs font-medium text-rose-600">{errors.type}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Tiền tệ</span>
          <input
            value={draft.currency}
            onChange={(event) => onChange('currency', event.target.value.toUpperCase())}
            placeholder="VND"
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.currency ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#7c6cff] focus:ring-2 focus:ring-[#7c6cff]/10'}`}
          />
          {errors.currency ? <p className="text-xs font-medium text-rose-600">{errors.currency}</p> : null}
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Số dư mở đầu</span>
          <input
            value={draft.balance}
            onChange={(event) => onChange('balance', event.target.value)}
            placeholder="0"
            inputMode="decimal"
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.balance ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#7c6cff] focus:ring-2 focus:ring-[#7c6cff]/10'}`}
          />
          {errors.balance ? <p className="text-xs font-medium text-rose-600">{errors.balance}</p> : null}
        </label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Huỷ
        </Button>
        <Button variant="primary" className="flex-1" onClick={onSubmit} disabled={submitting}>
          {submitting ? <Spinner /> : null}
          {submitting ? 'Đang lưu...' : 'Lưu tài khoản'}
        </Button>
      </div>
    </Modal>
  );
}

export default function AccountsModule({ initialAccounts, userId }: { initialAccounts: AccountRow[]; userId: string }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRow[]>(initialAccounts);
  const loading = false;
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountRow | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<AccountRow | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountDraft, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const averageBalance = accounts.length ? totalBalance / accounts.length : 0;
    return { totalBalance, averageBalance };
  }, [accounts]);

  const resetDraft = (account?: AccountRow | null) => {
    if (account) {
      setDraft({
        name: account.name ?? '',
        type: account.type ?? 'bank',
        balance: String(Number(account.balance ?? 0)),
        currency: account.currency ?? 'VND'
      });
      return;
    }
    setDraft(emptyDraft);
  };

  const openCreate = () => {
    resetDraft(null);
    setErrors({});
    setCreateOpen(true);
  };

  const openEdit = (account: AccountRow) => {
    setEditAccount(account);
    resetDraft(account);
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof AccountDraft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = 'Nhập tên tài khoản.';
    if (!draft.type.trim()) nextErrors.type = 'Chọn loại tài khoản.';
    if (!draft.currency.trim()) nextErrors.currency = 'Nhập tiền tệ.';
    const balanceValue = Number(draft.balance);
    if (!draft.balance.trim() || Number.isNaN(balanceValue) || balanceValue < 0) nextErrors.balance = 'Số dư phải là số không âm.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persistAccount = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editAccount) {
        const { data, error } = await (supabase.from('accounts') as any)
          .update({
            name: draft.name.trim(),
            type: draft.type,
            balance: Number(draft.balance),
            currency: draft.currency.trim().toUpperCase()
          })
          .eq('id', editAccount.id)
          .eq('user_id', userId)
          .select('*')
          .single();

        if (error) throw error;
        setAccounts((current) => current.map((account) => (account.id === editAccount.id ? (data as AccountRow) : account)));
        toast.success('Đã cập nhật tài khoản.');
        setEditAccount(null);
      } else {
        const payload: AccountInsert = {
          user_id: userId,
          name: draft.name.trim(),
          type: draft.type,
          balance: Number(draft.balance),
          currency: draft.currency.trim().toUpperCase()
        };
        const { data, error } = await supabase.from('accounts').insert(payload as any).select('*').single();
        if (error) throw error;
        setAccounts((current) => [data as AccountRow, ...current]);
        toast.success('Đã tạo tài khoản mới.');
        setCreateOpen(false);
      }
      setDraft(emptyDraft);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeAccount = async () => {
    if (!deleteAccount) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase.from('accounts') as any).delete().eq('id', deleteAccount.id).eq('user_id', userId);
      if (error) throw error;
      setAccounts((current) => current.filter((account) => account.id !== deleteAccount.id));
      toast.success('Đã xoá tài khoản.');
      setDeleteAccount(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xoá tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} lines={4} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.09),rgba(37,99,235,0.07))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f766e]">Accounts</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-main)]">Quản lý tài khoản</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Tạo, chỉnh sửa và xoá tài khoản với kiểm tra dữ liệu ngay tại giao diện. Mọi thay đổi đều được đồng bộ theo `user_id`.</p>
          </div>
          <Button onClick={openCreate} leftIcon={<AppIcon name="wallet" className="h-4 w-4" />} className="px-5 py-3">
            Tạo tài khoản
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Số tài khoản</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{accounts.length}</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Tổng số dư</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{fmtCurrency(totals.totalBalance)}</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Trung bình</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{fmtCurrency(totals.averageBalance)}</p>
          </div>
        </div>
      </section>

      {accounts.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <article key={account.id} className="group rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)] dark:bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${accountAccent(account.type)}`}>
                    <AppIcon name={account.type === 'cash' ? 'wallet' : account.type === 'credit' ? 'shield' : account.type === 'savings' ? 'target' : account.type === 'e_wallet' ? 'exchange' : 'dashboard'} className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{accountLabel(account.type)}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--text-main)]">{account.name}</h3>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <IconButton icon={<AppIcon name="edit" className="h-4 w-4" />} label="Sửa" onClick={() => openEdit(account)} kind="edit" />
                  <IconButton icon={<AppIcon name="trash" className="h-4 w-4" />} label="Xoá" onClick={() => setDeleteAccount(account)} kind="delete" />
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Số dư</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--text-main)]">{fmtCurrency(account.balance, account.currency)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{account.currency}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="Chưa có tài khoản nào"
          description="Tạo tài khoản đầu tiên để bắt đầu theo dõi số dư, giao dịch và báo cáo."
          icon={<AppIcon name="wallet" className="h-7 w-7" />}
          action={<Button leftIcon={<AppIcon name="wallet" className="h-4 w-4" />} onClick={openCreate}>Tạo tài khoản đầu tiên</Button>}
        />
      )}

      <AccountModal
        open={createOpen || Boolean(editAccount)}
        title={editAccount ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
        draft={draft}
        errors={errors}
        submitting={submitting}
        onClose={() => {
          setCreateOpen(false);
          setEditAccount(null);
        }}
        onChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
        onSubmit={persistAccount}
      />

      <ConfirmDialog
        open={Boolean(deleteAccount)}
        title="Xoá tài khoản?"
        description={`Tài khoản ${deleteAccount?.name ?? ''} sẽ bị xoá vĩnh viễn.`}
        confirmLabel={submitting ? 'Đang xoá...' : 'Xoá ngay'}
        danger
        onCancel={() => setDeleteAccount(null)}
        onConfirm={removeAccount}
      />
    </div>
  );
}
