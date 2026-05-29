import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-6 rounded-[24px] border border-[var(--border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eeedfe] text-[#6c63ff]">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </div>
      <h1 className="text-[28px] font-bold text-[var(--text-main)]">Không tìm thấy trang</h1>
      <p className="text-[var(--text-muted)]">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị thay đổi.</p>
      <Link href="/" className="inline-flex h-11 items-center justify-center rounded-full bg-[#6c63ff] px-6 text-sm font-semibold text-white hover:bg-[#5b54f5]">
        Quay lại dashboard
      </Link>
    </div>
  );
}
