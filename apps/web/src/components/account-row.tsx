'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast-provider';
import ConfirmDialog from '@/components/confirm-dialog';

interface AccountRowProps {
  account: {
    id: string;
    name: string;
    type: string;
    balance: number | string;
    currency: string;
  };
}

export default function AccountRow({ account }: AccountRowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [balance, setBalance] = useState(account.balance.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deleteAccount = async () => {
    setLoading(true);
    const { error } = await (supabase.from('accounts') as any).delete().eq('id', account.id);
    setLoading(false);
    setDeleteOpen(false);
    if (error) {
      toast({ type: 'error', title: 'Không thể xoá tài khoản', description: error.message });
      return;
    }

    toast({ type: 'success', title: 'Đã xoá tài khoản', description: 'Tài khoản đã được gỡ khỏi hệ thống.' });
    router.refresh();
  };

  const updateAccount = async () => {
    setError('');
    setLoading(true);
    const { error } = await (supabase.from('accounts') as any)
      .update({
        name,
        type,
        balance: Number(balance)
      })
      .eq('id', account.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      toast({ type: 'error', title: 'Không thể lưu thay đổi', description: error.message });
      return;
    }

    setEditing(false);
    toast({ type: 'success', title: 'Đã cập nhật tài khoản', description: 'Thông tin tài khoản đã được lưu.' });
    router.refresh();
  };

  return (
    <>
      <ConfirmDialog
        open={deleteOpen}
        title={`Xoá tài khoản ${account.name}?`}
        description="Hành động này không thể hoàn tác. Dữ liệu giao dịch gắn với tài khoản sẽ bị ảnh hưởng theo RLS và cascade hiện có."
        confirmLabel="Xoá tài khoản"
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={deleteAccount}
      />
      <div className="rounded-[12px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)]">Tên tài khoản</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)]">Loại</label>
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]">
              <option value="cash">Tiền mặt</option>
              <option value="bank">Ngân hàng</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)]">Số dư</label>
            <input value={balance} onChange={(event) => setBalance(event.target.value)} type="number" step="0.01" className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]" />
          </div>
          {error ? <p className="rounded-[12px] border border-[#e24b4a] bg-[#fef2f2] p-3 text-sm text-[#b42318]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button onClick={updateAccount} disabled={loading} className="rounded-full bg-[#6c63ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5b54f5] disabled:cursor-not-allowed disabled:bg-slate-400">
              Lưu
            </button>
            <button onClick={() => setEditing(false)} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-[#f9fafb]">
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[16px] font-semibold text-[var(--text-main)]">{account.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{account.type} • {account.currency}</p>
            </div>
            <p className={`font-mono text-[20px] font-semibold ${Number(account.balance) >= 0 ? 'text-[#1d9e75]' : 'text-[#e24b4a]'}`}>
              {Intl.NumberFormat('vi-VN', { style: 'currency', currency: account.currency }).format(Number(account.balance))}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEditing(true)} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-[#f9fafb]">
              Sửa
            </button>
            <button onClick={() => setDeleteOpen(true)} disabled={loading} className="rounded-full bg-[#e24b4a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c93b3a] disabled:cursor-not-allowed disabled:bg-rose-300">
              Xóa
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
