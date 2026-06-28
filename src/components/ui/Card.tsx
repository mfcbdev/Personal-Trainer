import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg bg-surface p-4 sm:p-5', className)}
      {...props}
    />
  );
}
