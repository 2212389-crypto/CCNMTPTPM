'use client';

import type { ReactNode } from 'react';

export function Modal({ open, title, children, onClose, widthClass = 'max-w-2xl' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; widthClass?: string }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className={`w-full ${widthClass} overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-card)] shadow-[0_30px_100px_rgba(15,23,42,0.3)]`}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Expense Manager</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-main)]">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-main)] transition hover:bg-black/5 dark:hover:bg-white/5">
            Đóng
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-white/5">
      {icon ? <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#f5d0fe] text-slate-700 dark:from-white/10 dark:to-white/5">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-[28px] border border-[var(--border)] bg-white/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
      <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="h-3 rounded-full bg-slate-200 dark:bg-white/10" style={{ width: `${90 - index * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}
