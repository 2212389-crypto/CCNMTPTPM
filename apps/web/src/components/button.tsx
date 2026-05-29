'use client';

import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  leftIcon,
  rightIcon,
  disabled,
  onClick,
  type = 'button'
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-slate-900 text-white border-none px-4 py-2 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
    secondary: 'bg-transparent border border-[var(--border)] text-[var(--text-main)] px-4 py-2 hover:bg-[var(--bg-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
    danger: 'bg-[#A32D2D] text-[#FCEBEB] px-4 py-2 hover:bg-[#791F1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A32D2D]',
    ghost: 'bg-transparent text-[var(--text-main)] px-3 py-2 hover:bg-[var(--bg-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900'
  };

  const classes = clsx(base, variants[variant], className, disabled && 'opacity-50 cursor-not-allowed');

  return (
    <button type={type} className={classes} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {leftIcon ? <span className="-ml-1">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="-mr-1">{rightIcon}</span> : null}
    </button>
  );
}
