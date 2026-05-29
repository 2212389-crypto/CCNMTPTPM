'use client';

import React from 'react';
import clsx from 'clsx';

export default function MonthNavButton({
  children,
  onClick,
  ariaLabel
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx('inline-flex items-center justify-center rounded-md p-2 transition bg-[var(--color-background-secondary)] hover:bg-[var(--color-text-primary)] hover:border-[var(--color-border-primary)]')}
      style={{ minWidth: 40, minHeight: 40 }}
    >
      <span style={{ width: 18, height: 18 }}>{children}</span>
    </button>
  );
}
