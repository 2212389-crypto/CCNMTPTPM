'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast-provider';

interface TransactionFormProps {
  userId: string;
  accounts: { id: string; name: string }[];
}

export default function TransactionForm({ userId, accounts }: TransactionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await (supabase.from('transactions') as any).insert({
      user_id: userId,
      account_id: accountId,
      amount: Number(amount),
      type,
      note: note || null,
      occurred_at: new Date().toISOString()
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      toast({ type: 'error', title: 'Không thể lưu giao dịch', description: error.message });
      return;
    }

    setAmount('0');
    setNote('');
    toast({ type: 'success', title: 'Đã lưu giao dịch', description: 'Giao dịch mới đã được cập nhật.' });
    router.refresh();
  };

  if (accounts.length === 0) {
    return (
      <section className="rounded-[12px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-[18px] font-semibold text-[var(--text-main)]">Thêm giao dịch</h2>
        <p className="mt-3 text-[15px] leading-6 text-[var(--text-muted)]">Bạn cần tạo ít nhất một tài khoản trước khi thêm giao dịch.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[12px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--border)] bg-[#fafbff] px-6 py-5">
        <h2 className="text-[18px] font-semibold text-[var(--text-main)]">Thêm giao dịch</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Ghi nhận khoản thu hoặc chi cho tài khoản của bạn.</p>
      </div>
      <form className="grid gap-4 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Tài khoản</label>
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)} className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]">
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Loại</label>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]">
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Số tiền</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" step="0.01" required className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Ghi chú</label>
          <input value={note} onChange={(event) => setNote(event.target.value)} className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
        </div>
        <div className="md:col-span-2">
          {error ? <p className="mb-4 rounded-[12px] border border-[#e24b4a] bg-[#fef2f2] p-4 text-sm text-[#b42318]">{error}</p> : null}
          <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#6c63ff] px-6 text-sm font-semibold text-white transition hover:bg-[#5b54f5] disabled:cursor-not-allowed disabled:bg-slate-400">
            {loading ? 'Đang lưu...' : 'Thêm giao dịch'}
          </button>
        </div>
      </form>
    </section>
  );
}
