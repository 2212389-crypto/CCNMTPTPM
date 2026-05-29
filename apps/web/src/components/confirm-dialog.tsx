"use client";

import { useEffect } from 'react';
import Button from './button';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Huỷ',
  danger = false,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-[#fef2f2] text-[#e24b4a]' : 'bg-[#fffbeb] text-[#ef9f27]'}`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4m0 4h.01M10.3 4.5h3.4l8 13.7A2 2 0 0 1 19.8 21H4.2a2 2 0 0 1-1.9-2.8l8-13.7Z" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-[var(--text-main)]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}