import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-zinc-800 bg-surface px-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent transition-colors',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
