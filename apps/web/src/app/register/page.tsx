'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/auth';
import { useToast } from '@/components/toast-provider';
import { AppIcon } from '@/components/icons';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      toast({ type: 'warning', title: 'Chưa thể đăng ký', description: 'Mật khẩu không khớp.' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      toast({ type: 'error', title: 'Lỗi đăng ký', description: error.message });
      return;
    }

    toast({ type: 'success', title: 'Tạo tài khoản thành công', description: 'Bạn có thể đăng nhập ngay bây giờ.' });
    router.push(isAdminEmail(data.user?.email) ? '/admin' : '/login');
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="bg-[#1a1d23] p-8 text-white lg:p-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6c63ff,#378add)] shadow-[var(--shadow-card)]">
          <AppIcon name="wallet" className="h-6 w-6" />
        </div>
        <h1 className="mt-8 text-[28px] font-bold leading-tight">Tạo tài khoản để bắt đầu theo dõi thu chi trong một giao diện rõ ràng hơn.</h1>
        <p className="mt-4 text-sm leading-6 text-white/70">Hệ thống vẫn giữ nguyên Supabase auth và RLS, chỉ đổi trải nghiệm theo hướng chuyên nghiệp hơn cho người dùng và admin.</p>

        <div className="mt-8 space-y-3">
          {['Không cần chờ email xác nhận', 'Phân quyền ADMIN theo email', 'Trải nghiệm đồng bộ desktop và mobile'].map((item) => (
            <div key={item} className="rounded-[12px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--bg-card)] p-8 lg:p-10">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">Đăng ký</p>
          <h2 className="mt-3 text-[28px] font-bold text-[var(--text-main)]">Tạo tài khoản mới</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--text-muted)]">Dùng email và mật khẩu để bắt đầu ngay.</p>

          {error ? <div className="mt-5 rounded-[12px] border border-[#e24b4a] bg-[#fef2f2] p-4 text-sm text-[#b42318]">{error}</div> : null}

          <form className="mt-6 space-y-5" onSubmit={handleRegister}>
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
                autoComplete="new-password"
                required
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)]">Nhập lại mật khẩu</label>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                required
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--border)] bg-white px-4 text-[15px] outline-none transition focus:border-[#6c63ff]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#6c63ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5b54f5] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-[#6c63ff] hover:text-[#4c46db]">
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
