import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'default' && 'bg-zinc-800 text-zinc-300',
        variant === 'accent' && 'bg-accent/15 text-accent',
        className,
      )}
      {...props}
    />
  );
}
