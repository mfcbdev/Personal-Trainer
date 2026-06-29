export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;

  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-800">
      <div
        className="h-full rounded-full bg-accent transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
