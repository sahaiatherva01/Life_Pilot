import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'orion' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variants = {
    cyan: 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.15)]',
    orion: 'bg-purple-950/40 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(121,40,202,0.2)]',
    success: 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-950/40 text-amber-300 border border-amber-500/30',
    error: 'bg-rose-950/40 text-rose-300 border border-rose-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  };

  const dots = {
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#00F2FE]',
    orion: 'bg-purple-400 shadow-[0_0_8px_#7928CA]',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full tracking-wide select-none',
          sizes[size],
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  );
};
