import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-slate-300 tracking-wide select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#0F1218] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200',
                'focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 focus:shadow-[0_0_15px_rgba(0,242,254,0.15)]',
                leftIcon && 'pl-9',
                rightIcon && 'pr-9',
                error && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400 flex items-center">{rightIcon}</span>
          )}
        </div>
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
