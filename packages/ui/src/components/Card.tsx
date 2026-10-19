import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'cyan' | 'orion' | 'subtle';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = 'none', interactive = false, children, ...props }, ref) => {
    const glowStyles = {
      none: '',
      subtle: 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
      cyan: 'shadow-[0_0_30px_rgba(0,242,254,0.12)] border-cyan-500/30 hover:border-cyan-400/50',
      orion: 'shadow-[0_0_35px_rgba(121,40,202,0.18)] border-purple-500/30 hover:border-purple-400/50',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'bg-[#14171F]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 text-slate-100 transition-all duration-200',
            glowStyles[glow],
            interactive &&
              'hover:bg-[#1B202B]/90 hover:border-white/[0.16] cursor-pointer hover:-translate-y-0.5',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
