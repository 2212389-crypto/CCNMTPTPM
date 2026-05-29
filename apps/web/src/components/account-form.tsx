'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import { useToast } from '@/components/toast-provider';

export default function AccountForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await (supabase.from('accounts') as any).insert({
      user_id: userId,
      name,
      type,
      balance: Number(balance),
      currency: 'VND'
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      toast({ type: 'error', title: 'Không thể tạo tài khoản', description: error.message });
      return;
    }

    setName('');
    setBalance('0');
    setType('cash');
    toast({ type: 'success', title: 'Đã tạo tài khoản', description: 'Tài khoản mới đã sẵn sàng sử dụng.' });
    router.refresh();
  };

  return (
    <section className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--border)] bg-[#fafbff] px-6 py-5">
        <h2 className="text-[18px] font-semibold text-[var(--text-main)]">Tạo tài khoản mới</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Thêm tài khoản tiền mặt, ngân hàng hoặc thẻ để bắt đầu theo dõi số dư.</p>
      </div>
      <form className="grid gap-4 p-6 md:grid-cols-3" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Tên tài khoản</label>
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ví tiền mặt, Tài khoản MB Bank..." className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Loại</label>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]">
            <option value="cash">Tiền mặt</option>
            <option value="bank">Ngân hàng</option>
            <option value="card">Thẻ</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">Số dư ban đầu</label>
          <input value={balance} onChange={(event) => setBalance(event.target.value)} required type="number" step="0.01" className="h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
        </div>
        <div className="md:col-span-3">
          {error ? <div className="mb-4 rounded-[12px] border border-[#e24b4a] bg-[#fef2f2] p-4 text-sm text-[#b42318]">{error}</div> : null}
          <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#6c63ff] px-6 text-sm font-semibold text-white transition hover:bg-[#5b54f5] disabled:cursor-not-allowed disabled:bg-slate-400">
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>
    </section>
  );
}
