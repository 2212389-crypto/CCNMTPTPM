import Link from 'next/link';

export default function Forbidden() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">403 Forbidden</p>
      <h1 className="text-4xl font-semibold text-slate-900">Bạn không có quyền truy cập</h1>
      <p className="text-slate-600">Trang quản trị chỉ dành cho tài khoản ADMIN đã được xác định theo email.</p>
      <Link href="/" className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
        Quay lại dashboard
      </Link>
    </div>
  );
}
