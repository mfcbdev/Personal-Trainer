interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function SliderInput({ label, value, onChange, min = 0, max = 10 }: SliderInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="font-mono text-sm text-accent">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-zinc-800 accent-accent"
      />
    </div>
  );
}
