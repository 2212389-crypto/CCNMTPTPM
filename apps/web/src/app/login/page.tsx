'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/auth';
import { useToast } from '@/components/toast-provider';
import { AppIcon } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        toast({ type: 'error', title: 'Lỗi đăng nhập', description: error.message });
        return;
      }

      const userEmail = data?.user?.email ?? '';
      toast({ type: 'success', title: 'Đăng nhập thành công', description: isAdminEmail(userEmail) ? 'Chào mừng ADMIN quay lại.' : 'Chào mừng bạn quay lại Expense Manager.' });
      router.push(isAdminEmail(userEmail) ? '/admin' : '/');
    } catch (err: any) {
      const message = err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.';
      setError(message);
      toast({ type: 'error', title: 'Không thể đăng nhập', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(108,99,255,0.12),rgba(55,138,221,0.08))] p-8 lg:p-10">
        <div className="absolute -right-14 top-0 h-40 w-40 rounded-full bg-[#6c63ff]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#378add]/10 blur-3xl" />
        <div className="relative space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6c63ff,#378add)] text-white shadow-[var(--shadow-card)]">
            <AppIcon name="wallet" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Expense Manager</p>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-[var(--text-main)]">Đăng nhập để tiếp tục quản lý tài chính theo cách rõ ràng hơn.</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[var(--text-muted)]">Giao diện được tối ưu cho thói quen thao tác nhanh: nhìn số dư, thêm giao dịch và xem báo cáo chỉ trong vài cú nhấp.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Bảo mật Supabase + RLS',
              'Phân quyền ADMIN/USER rõ ràng',
              'Thiết kế tối ưu cho mobile',
              'Toast lỗi thay cho alert'
            ].map((item) => (
              <div key={item} className="rounded-[12px] border border-white/70 bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-card)] p-8 lg:p-10">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Đăng nhập</p>
          <h2 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Chào mừng trở lại</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--text-muted)]">Nhập email và mật khẩu Supabase của bạn để vào dashboard.</p>

          {error ? <div className="mt-5 rounded-[12px] border border-[#e24b4a] bg-[#fef2f2] p-4 text-sm text-[#b42318]">{error}</div> : null}

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)]">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)]">Mật khẩu</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6c63ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5b54f5] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-[#6c63ff] hover:text-[#4c46db]">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
