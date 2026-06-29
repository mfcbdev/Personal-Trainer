import { type ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';

interface OnboardingStepShellProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function OnboardingStepShell({ step, total, title, subtitle, children, footer }: OnboardingStepShellProps) {
  return (
    <div className="flex min-h-full flex-col px-5 py-6 sm:max-w-md sm:mx-auto">
      <ProgressBar step={step} total={total} />
      <div className="flex-1 mt-8">
        <h1 className="font-display text-2xl font-semibold text-zinc-50 mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>}
        <div className="space-y-5">{children}</div>
      </div>
      <div className="mt-8 flex gap-3">{footer}</div>
    </div>
  );
}
