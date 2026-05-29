export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-80 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 h-11 w-36 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[12px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[12px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]" />
        <div className="h-72 animate-pulse rounded-[12px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]" />
      </div>
    </div>
  );
}