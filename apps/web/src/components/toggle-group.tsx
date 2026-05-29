'use client';

import React from 'react';
import clsx from 'clsx';

export default function ToggleGroup({
  value,
  onChange,
  leftLabel = 'Thu',
  rightLabel = 'Chi'
}: {
  value: 'income' | 'expense';
  onChange: (v: 'income' | 'expense') => void;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <div className="inline-flex rounded-md border border-[var(--color-border-primary)] overflow-hidden">
      <button
        type="button"
        onClick={() => onChange('income')}
        className={clsx('px-4 py-2', value === 'income' ? 'bg-[var(--color-text-primary)] text-white font-medium' : 'bg-transparent text-[var(--text-secondary)]')}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('expense')}
        className={clsx('px-4 py-2', value === 'expense' ? 'bg-[var(--color-text-primary)] text-white font-medium' : 'bg-transparent text-[var(--text-secondary)]')}
      >
        {rightLabel}
      </button>
    </div>
  );
}
