'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastIcon({ type }: { type: ToastType }) {
  const stroke = type === 'error' ? '#e24b4a' : type === 'warning' ? '#ef9f27' : type === 'info' ? '#378add' : '#1d9e75';
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity="0.2" />
      <path d={type === 'success' ? 'M8 12.5l2.5 2.5L16 9.5' : type === 'error' ? 'M9 9l6 6M15 9l-6 6' : type === 'warning' ? 'M12 8v5m0 3h.01' : 'M12 8h.01M11 12h1v4h1'} />
    </svg>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: Omit<Toast, 'id'>) => {
      const id = idRef.current++;
      setToasts((current) => [...current, { ...input, id }]);
      window.setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[min(100vw-2rem,24rem)] flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto overflow-hidden rounded-[12px] border bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.12)]',
              item.type === 'success' && 'border-[#1d9e75] bg-[#f0fdf4]',
              item.type === 'error' && 'border-[#e24b4a] bg-[#fef2f2]',
              item.type === 'warning' && 'border-[#ef9f27] bg-[#fffbeb]',
              item.type === 'info' && 'border-[#378add] bg-[#eff6ff]'
            )}
          >
            <div className="flex items-start gap-3">
              <ToastIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-main)]">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-[var(--text-muted)]">{item.description}</p> : null}
              </div>
              <button onClick={() => removeToast(item.id)} className="rounded-full p-1 text-[var(--text-muted)] hover:bg-black/5" aria-label="Đóng thông báo">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/5">
              <div className="h-full w-full origin-left animate-[toast-shrink_4s_linear_forwards] bg-black/15" />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}