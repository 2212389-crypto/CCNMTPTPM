'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase-client';
import { BUDGET_SCOPES, CATEGORY_OPTIONS, fmtCurrency, monthLabel } from '@/lib/expense';
import { AppIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import { EmptyState, Modal, SkeletonCard, Spinner } from '@/components/ui-kit';
import Button from '@/components/button';
import IconButton from '@/components/icon-button';
import { toast } from 'sonner';

type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

type Draft = {
  name: string;
  category: string;
  amount: string;
  scope: 'monthly' | 'yearly' | 'category';
  month: string;
  year: string;
};

const emptyDraft: Draft = {
  name: '',
  category: 'Khác',
  amount: '',
  scope: 'monthly',
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  year: String(new Date().getFullYear())
};

function monthKey(value: string | null | undefined) {
  const date = new Date(value ?? '');
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetModule({ userId, budgets: initialBudgets, transactions }: { userId: string; budgets: BudgetRow[]; transactions: TransactionRow[] }) {
  const router = useRouter();
  const [budgets, setBudgets] = useState<BudgetRow[]>(initialBudgets);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<BudgetRow | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<BudgetRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loading = false;
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  const budgetSpending = useMemo(() => {
    return budgets.map((budget) => {
      const amount = Number((budget.amount ?? budget.limit_amount) || 0);
      const selectedMonth = budget.month ?? new Date().getMonth() + 1;
      const selectedYear = budget.year ?? new Date().getFullYear();
      const scopedTransactions = transactions.filter((transaction) => {
        const transactionDate = monthKey(transaction.date ?? transaction.occurred_at);
        const targetKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const matchesPeriod = budget.scope === 'yearly' ? transactionDate.startsWith(String(selectedYear)) : transactionDate === targetKey;
        const matchesCategory = budget.scope === 'category' ? (transaction.category ?? 'Khác') === (budget.category ?? budget.name ?? 'Khác') : true;
        return transaction.type === 'expense' && matchesPeriod && matchesCategory;
      });
      const spent = scopedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
      return { budget, amount, spent };
    });
  }, [budgets, transactions]);

  const resetDraft = (budget?: BudgetRow | null) => {
    if (budget) {
      setDraft({
        name: budget.name ?? budget.category ?? '',
        category: budget.category ?? 'Khác',
        amount: String(Number(budget.amount ?? budget.limit_amount ?? 0)),
        scope: budget.scope === 'category' ? 'category' : budget.scope === 'yearly' ? 'yearly' : 'monthly',
        month: String(budget.month ?? new Date().getMonth() + 1).padStart(2, '0'),
        year: String(budget.year ?? new Date().getFullYear())
      });
      return;
    }
    setDraft(emptyDraft);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof Draft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = 'Nhập tên ngân sách.';
    if (!draft.amount.trim() || Number.isNaN(Number(draft.amount)) || Number(draft.amount) <= 0) nextErrors.amount = 'Số tiền phải lớn hơn 0.';
    if (draft.scope === 'monthly' || draft.scope === 'yearly') {
      if (!draft.month.trim()) nextErrors.month = 'Chọn tháng.';
      if (!draft.year.trim()) nextErrors.year = 'Chọn năm.';
    }
    if (draft.scope === 'category' && !draft.category.trim()) nextErrors.category = 'Chọn danh mục.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persist = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        name: draft.name.trim(),
        category: draft.scope === 'category' ? draft.category.trim() : draft.name.trim(),
        scope: draft.scope,
        amount: Number(draft.amount),
        limit_amount: Number(draft.amount),
        spent_amount: 0,
        month: draft.scope === 'category' ? null : Number(draft.month),
        year: draft.scope === 'category' ? null : Number(draft.year),
        threshold_70: true,
        threshold_90: true,
        threshold_100: true
      };

      if (editBudget) {
        const { data, error } = await (supabase.from('budgets') as any).update(payload as any).eq('id', editBudget.id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        setBudgets((current) => current.map((budget) => (budget.id === editBudget.id ? (data as BudgetRow) : budget)));
        toast.success('Đã cập nhật ngân sách.');
        setEditBudget(null);
      } else {
        const { data, error } = await (supabase.from('budgets') as any).insert(payload as any).select('*').single();
        if (error) throw error;
        setBudgets((current) => [data as BudgetRow, ...current]);
        toast.success('Đã tạo ngân sách.');
        setCreateOpen(false);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ngân sách.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleteBudget) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase.from('budgets') as any).delete().eq('id', deleteBudget.id).eq('user_id', userId);
      if (error) throw error;
      setBudgets((current) => current.filter((budget) => budget.id !== deleteBudget.id));
      toast.success('Đã xoá ngân sách.');
      setDeleteBudget(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xoá ngân sách.');
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
      <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(245,158,11,0.09),rgba(14,165,233,0.08))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f59e0b]">Budget</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-main)]">Ngân sách & cảnh báo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Quản lý ngân sách theo tháng, năm hoặc danh mục. Tiến độ được tính từ các giao dịch chi tiêu thực tế trong cùng kỳ.</p>
          </div>
          <Button onClick={() => { resetDraft(null); setErrors({}); setCreateOpen(true); }} leftIcon={<AppIcon name="target" className="h-4 w-4" />} className="px-5 py-3">
            Tạo ngân sách
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat title="Tổng ngân sách" value={fmtCurrency(budgets.reduce((sum, budget) => sum + Number(budget.amount ?? budget.limit_amount ?? 0), 0))} />
          <Stat title="Đã dùng" value={fmtCurrency(budgetSpending.reduce((sum, item) => sum + item.spent, 0))} />
          <Stat title="Số ngân sách" value={String(budgets.length)} />
        </div>
      </section>

      {budgets.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgetSpending.map(({ budget, amount, spent }) => {
            const progress = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;
            return (
              <article key={budget.id} className="group rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{budget.scope}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--text-main)]">{budget.name ?? budget.category ?? 'Ngân sách'}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{budget.scope === 'monthly' || budget.scope === 'yearly' ? monthLabel(Number(budget.year ?? new Date().getFullYear()), Number(budget.month ?? new Date().getMonth() + 1)) : budget.category ?? 'Theo danh mục'}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <IconButton icon={<AppIcon name="edit" className="h-4 w-4" />} label="Sửa" onClick={() => { setEditBudget(budget); resetDraft(budget); setErrors({}); }} kind="edit" />
                    <IconButton icon={<AppIcon name="trash" className="h-4 w-4" />} label="Xoá" onClick={() => setDeleteBudget(budget)} kind="delete" />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium text-[var(--text-muted)]">
                    <span>Tiến độ</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${progress >= 90 ? 'bg-rose-500' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Đã dùng</p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--text-main)]">{fmtCurrency(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Ngân sách</p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--text-main)]">{fmtCurrency(amount)}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState title="Chưa có ngân sách" description="Tạo ngân sách đầu tiên để theo dõi mức chi và cảnh báo vượt ngưỡng." icon={<AppIcon name="target" className="h-7 w-7" />} action={<Button leftIcon={<AppIcon name="target" className="h-4 w-4" />} onClick={() => { resetDraft(null); setErrors({}); setCreateOpen(true); }}>Tạo ngân sách</Button>} />
      )}

      <BudgetModal
        open={createOpen || Boolean(editBudget)}
        title={editBudget ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách mới'}
        draft={draft}
        errors={errors}
        submitting={submitting}
        onClose={() => {
          setCreateOpen(false);
          setEditBudget(null);
        }}
        onChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
        onSubmit={persist}
      />

      <ConfirmDialog open={Boolean(deleteBudget)} title="Xoá ngân sách?" description={`Ngân sách ${deleteBudget?.name ?? ''} sẽ bị xoá vĩnh viễn.`} confirmLabel={submitting ? 'Đang xoá...' : 'Xoá ngay'} danger onCancel={() => setDeleteBudget(null)} onConfirm={remove} />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}

function BudgetModal({ open, title, draft, errors, submitting, onClose, onChange, onSubmit }: { open: boolean; title: string; draft: Draft; errors: Partial<Record<keyof Draft, string>>; submitting: boolean; onClose: () => void; onChange: (field: keyof Draft, value: string) => void; onSubmit: () => void; }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Tên ngân sách</span>
          <input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Ví dụ: Ăn uống tháng 8" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.name ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10'}`} />
          {errors.name ? <p className="text-xs font-medium text-rose-600">{errors.name}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Kiểu ngân sách</span>
          <select value={draft.scope} onChange={(event) => onChange('scope', event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10">
            {BUDGET_SCOPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Số tiền</span>
          <input value={draft.amount} onChange={(event) => onChange('amount', event.target.value)} inputMode="decimal" placeholder="0" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.amount ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10'}`} />
          {errors.amount ? <p className="text-xs font-medium text-rose-600">{errors.amount}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Tháng</span>
          <input value={draft.month} onChange={(event) => onChange('month', event.target.value)} inputMode="numeric" placeholder="08" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.month ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10'}`} />
          {errors.month ? <p className="text-xs font-medium text-rose-600">{errors.month}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Năm</span>
          <input value={draft.year} onChange={(event) => onChange('year', event.target.value)} inputMode="numeric" placeholder="2026" className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.year ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10'}`} />
          {errors.year ? <p className="text-xs font-medium text-rose-600">{errors.year}</p> : null}
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[var(--text-main)]">Danh mục</span>
          <input list="budget-categories" value={draft.category} onChange={(event) => onChange('category', event.target.value)} placeholder="Ăn uống, Di chuyển..." className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${errors.category ? 'border-rose-500 ring-2 ring-rose-100' : 'border-[var(--border)] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/10'}`} />
          <datalist id="budget-categories">
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value} />
            ))}
          </datalist>
          {errors.category ? <p className="text-xs font-medium text-rose-600">{errors.category}</p> : null}
        </label>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Huỷ
        </Button>
        <Button variant="primary" className="flex-1" onClick={onSubmit} disabled={submitting}>
          {submitting ? <Spinner /> : null}
          {submitting ? 'Đang lưu...' : 'Lưu ngân sách'}
        </Button>
      </div>
    </Modal>
  );
}
