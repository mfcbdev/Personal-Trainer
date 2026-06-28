import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-transform active:scale-97 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'bg-accent text-zinc-950 hover:brightness-110',
          variant === 'secondary' && 'bg-surface text-zinc-50 hover:bg-zinc-800',
          variant === 'ghost' && 'bg-transparent text-zinc-400 hover:text-zinc-50',
          size === 'md' && 'h-11 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
