import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'glow' | 'primary' | 'outline' | 'ghost' | 'orion';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 font-semibold',
    };

    const variants = {
      glow: 'bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_28px_rgba(0,242,254,0.55)] hover:bg-cyan-300 border border-cyan-300/50',
      primary:
        'bg-slate-800/90 text-slate-100 hover:bg-slate-700/90 border border-slate-700/80 shadow-sm hover:border-slate-600',
      outline:
        'border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-950/20',
      ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
      orion:
        'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-[0_0_22px_rgba(121,40,202,0.4)] hover:shadow-[0_0_30px_rgba(121,40,202,0.6)] hover:brightness-110 border border-purple-400/30',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, sizes[size], variants[variant], className))}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
