import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 mb-5">
      <h1 className="font-display text-xl font-semibold text-zinc-50 truncate min-w-0">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
