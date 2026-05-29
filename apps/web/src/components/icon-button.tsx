'use client';

import React from 'react';
import clsx from 'clsx';

export default function IconButton({
  icon,
  label,
  kind = 'default',
  onClick
}: {
  icon: React.ReactNode;
  label?: string;
  kind?: 'edit' | 'delete' | 'default';
  onClick?: (e: React.MouseEvent) => void;
}) {
  const base = 'inline-flex items-center justify-center rounded-md p-[7px] border text-sm transition';
  const styles = {
    default: 'border-[var(--border)] bg-transparent hover:bg-[var(--bg-card)]',
    edit: 'border-[var(--border)] bg-transparent hover:bg-[var(--bg-card)]',
    delete: 'border-[var(--border)] bg-transparent hover:bg-[#FCEBEB] hover:text-[#A32D2D] hover:border-[#F09595]'
  } as const;

  return (
    <button aria-label={label} className={clsx(base, styles[kind])} style={{ minWidth: 34, minHeight: 34 }} onClick={onClick}>
      <span className="h-4 w-4">{icon}</span>
    </button>
  );
}
