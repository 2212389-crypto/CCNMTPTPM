'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase-client';
import { CATEGORY_OPTIONS, fmtCurrency, fmtDate, TRANSACTION_TYPES } from '@/lib/expense';
import { AppIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import { EmptyState, Modal, SkeletonCard, Spinner } from '@/components/ui-kit';
import Button from '@/components/button';
import IconButton from '@/components/icon-button';
import { toast } from 'sonner';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

type Draft = {
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  date: string;
  category: string;
  note: string;
};

const emptyDraft: Draft = {
  account_id: '',
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'Khác',
  note: ''
};

function transactionSign(type: string) {
  return type === 'income' ? '+' : type === 'expense' ? '-' : '↔';
}

function typeColor(type: string) {
  return type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-600' : 'text-sky-600';
}

export default function TransactionsModule({
  userId,
  accounts,
  initialTransactions
}: {
  userId: string;
  accounts: AccountRow[];
  initialTransactions: TransactionRow[];
}) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRow[]>(initialTransactions);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<TransactionRow | null>(null);
  const [deleteTx, setDeleteTx] = useState<TransactionRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loading = false;
  const [filters, setFilters] = useState({ type: 'all', account_id: 'all', search: '' });
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);

  const visibleTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = filters.type === 'all' || transaction.type === filters.type;
      const matchesAccount = filters.account_id === 'all' || transaction.account_id === filters.account_id;
      const haystack = [transaction.note, transaction.category, accountMap.get(transaction.account_id)?.name, transaction.type].join(' ').toLowerCase();
      const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase());
      return matchesType && matchesAccount && matchesSearch;
    });
  }, [accountMap, filters, transactions]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (accumulator, transaction) => {
        const amount = Number(transaction.amount || 0);
        if (transaction.type === 'income') accumulator.income += amount;
        if (transaction.type === 'expense') accumulator.expense += amount;
        if (transaction.type === 'transfer') accumulator.transfer += amount;
        return accumulator;
      },
      { income: 0, expense: 0, transfer: 0 }
    );
  }, [transactions]);

  const resetDraft = (transaction?: TransactionRow | null) => {
    if (transaction) {
      setDraft({
        account_id: transaction.account_id,
        type: transaction.type as Draft['type'],
        amount: String(Number(transaction.amount ?? 0)),
        date: (transaction.date ?? transaction.occurred_at ?? new Date().toISOString()).slice(0, 10),
        category: transaction.category ?? 'Khác',
        note: transaction.note ?? ''
      });
      return;
    }
    setDraft({ ...emptyDraft, account_id: accounts[0]?.id ?? '' });
  };

  const openCreate = () => {
    resetDraft(null);
    setErrors({});
    setCreateOpen(true);
  };

  const openEdit = (transaction: TransactionRow) => {
    setEditTx(transaction);
    resetDraft(transaction);
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof Draft, string>> = {};
    if (!draft.account_id) nextErrors.account_id = 'Chọn tài khoản.';
    if (!draft.amount.trim() || Number.isNaN(Number(draft.amount)) || Number(draft.amount) <= 0) nextErrors.amount = 'Số tiền phải lớn hơn 0.';
    if (!draft.date) nextErrors.date = 'Chọn ngày giao dịch.';
    if (!draft.category.trim()) nextErrors.category = 'Chọn hoặc nhập danh mục.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persist = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Get auth token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Vui lòng đăng nhập lại');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const payload = {
        type: draft.type.toUpperCase() as 'INCOME' | 'EXPENSE' | 'TRANSFER',
        amount: Number(draft.amount),
        occurredAt: `${draft.date}T00:00:00.000Z`,
        accountId: draft.account_id,
        category: draft.category.trim() || 'Khác',
        note: draft.note.trim() || null
      };

      if (editTx) {
        const response = await fetch(`${apiUrl}/transactions/${editTx.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Không thể cập nhật giao dịch');
        }

        const updatedTx = await response.json();
        setTransactions((current) =>
          current.map((transaction) =>
            transaction.id === editTx.id
              ? { ...updatedTx, account_id: updatedTx.accountId, occurred_at: updatedTx.occurredAt }
              : transaction
          )
        );
        toast.success('Đã cập nhật giao dịch.');
        setEditTx(null);
      } else {
        const response = await fetch(`${apiUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Không thể tạo giao dịch');
        }

        const newTx = await response.json();
        setTransactions((current) => [{ ...newTx, account_id: newTx.accountId, occurred_at: newTx.occurredAt }, ...current]);
        toast.success('Đã thêm giao dịch.');
        setCreateOpen(false);
      }
      router.refresh();
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể lưu giao dịch.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleteTx) return;
    setSubmitting(true);
    try {
      // Get auth token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Vui lòng đăng nhập lại');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/transactions/${deleteTx.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xoá giao dịch');
      }

      setTransactions((current) => current.filter((transaction) => transaction.id !== deleteTx.id));
      toast.success('Đã xoá giao dịch.');
      setDeleteTx(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể xoá giao dịch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(15,118,110,0.08))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2563eb]">Transactions</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-main)]">Giao dịch & dòng tiền</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Ghi nhận thu, chi, chuyển khoản bằng modal, lọc theo tài khoản / loại giao dịch và chỉnh sửa ngay trên danh sách.</p>
          </div>
          <Button onClick={openCreate} leftIcon={<AppIcon name="exchange" className="h-4 w-4" />} className="px-5 py-3">
            Thêm giao dịch
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric title="Tổng thu" value={fmtCurrency(summary.income)} accent="text-emerald-600" />
          <Metric title="Tổng chi" value={fmtCurrency(summary.expense)} accent="text-rose-600" />
          <Metric title="Chuyển khoản" value={fmtCurrency(summary.transfer)} accent="text-sky-600" />
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Tìm giao dịch, danh mục..." className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10" />
          <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10">
            <option value="all">Tất cả loại</option>
            {TRANSACTION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select value={filters.account_id} onChange={(event) => setFilters((current) => ({ ...current, account_id: event.target.value }))} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10">
            <option value="all">Tất cả tài khoản</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <Button variant="ghost" onClick={() => setFilters({ type: 'all', account_id: 'all', search: '' })} className="rounded-2xl px-4 py-3 text-sm font-semibold">
            Xoá bộ lọc
          </Button>
        </div>
      </section>

      {visibleTransactions.length > 0 ? (
        <section className="grid gap-4">
          {visibleTransactions.map((transaction) => {
            const account = accountMap.get(transaction.account_id);
            return (
              <article key={transaction.id} className="group rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 dark:bg-white/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold ${typeColor(transaction.type)}`}>{transactionSign(transaction.type)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">{transaction.category ?? 'Giao dịch'}</h3>
                        <span className={`rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold ${typeColor(transaction.type)}`}>{TRANSACTION_TYPES.find((item) => item.value === transaction.type)?.label ?? transaction.type}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">{account?.name ?? 'Tài khoản không xác định'} · {fmtDate(transaction.date ?? transaction.occurred_at)}{transaction.note ? ` · ${transaction.note}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-2xl font-semibold ${typeColor(transaction.type)}`}>{transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : '↔'}{fmtCurrency(transaction.amount, account?.currency ?? 'VND')}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <IconButton icon={<AppIcon name="edit" className="h-4 w-4" />} label="Sửa" onClick={() => openEdit(transaction)} kind="edit" />
                      <IconButton icon={<AppIcon name="trash" className="h-4 w-4" />} label="Xoá" onClick={() => setDeleteTx(transaction)} kind="delete" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="Chưa có giao dịch phù hợp"
          description="Thử đổi bộ lọc hoặc tạo giao dịch đầu tiên để bắt đầu ghi nhận dòng tiền."
          icon={<AppIcon name="exchange" className="h-7 w-7" />}
          action={<Button leftIcon={<AppIcon name="exchange" className="h-4 w-4" />} onClick={openCreate}>Thêm giao dịch</Button>}
        />
      )}

      <TransactionModal
        open={createOpen || Boolean(editTx)}
        title={editTx ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        accounts={accounts}
        draft={draft}
        errors={errors}
        submitting={submitting}
        onClose={() => {
          setCreateOpen(false);
          setEditTx(null);
        }}
        onChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
        onSubmit={persist}
      />

      <ConfirmDialog
        open={Boolean(deleteTx)}
        title="Xoá giao dịch?"
        description={`Giao dịch ${deleteTx?.category ?? ''} sẽ bị xoá vĩnh viễn.`}
        confirmLabel={submitting ? 'Đang xoá...' : 'Xoá ngay'}
        danger
        onCancel={() => setDeleteTx(null)}
        onConfirm={remove}
      />
    </div>
  );
}

function Metric({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{title}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function TransactionModal({
  open,
  title,
  accounts,
  draft,
  errors,
  submitting,
  onClose,
  onChange,
  onSubmit
}: {
  open: boolean;
  title: string;
  accounts: AccountRow[];
  draft: Draft;
  errors: Partial<Record<keyof Draft, string>>;
  submitting: boolean;
  onClose: () => void;
  onChange: (field: keyof Draft, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} widthClass="max-w-3xl">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Tài khoản</span>
          <select value={draft.account_id} onChange={(event) => onChange('account_id', event.target.value)} className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.account_id ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'}`}>
            <option value="">Chọn tài khoản</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.account_id ? <p className="text-xs font-medium text-rose-600">{errors.account_id}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Loại giao dịch</span>
          <select value={draft.type} onChange={(event) => onChange('type', event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10">
            {TRANSACTION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Số tiền</span>
          <input value={draft.amount} onChange={(event) => onChange('amount', event.target.value)} inputMode="decimal" placeholder="0" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.amount ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'}`} />
          {errors.amount ? <p className="text-xs font-medium text-rose-600">{errors.amount}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Ngày</span>
          <input value={draft.date} onChange={(event) => onChange('date', event.target.value)} type="date" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.date ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'}`} />
          {errors.date ? <p className="text-xs font-medium text-rose-600">{errors.date}</p> : null}
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Danh mục</span>
          <input list="transaction-categories" value={draft.category} onChange={(event) => onChange('category', event.target.value)} placeholder="Ăn uống, Di chuyển..." className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.category ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'}`} />
          <datalist id="transaction-categories">
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value} />
            ))}
          </datalist>
          {errors.category ? <p className="text-xs font-medium text-rose-600">{errors.category}</p> : null}
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Ghi chú</span>
          <textarea value={draft.note} onChange={(event) => onChange('note', event.target.value)} rows={4} placeholder="Nhập mô tả ngắn cho giao dịch" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10" />
        </label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Huỷ
        </Button>
        <Button variant="primary" className="flex-1" onClick={onSubmit} disabled={submitting}>
          {submitting ? <Spinner /> : null}
          {submitting ? 'Đang lưu...' : 'Lưu giao dịch'}
        </Button>
      </div>
    </Modal>
  );
}
