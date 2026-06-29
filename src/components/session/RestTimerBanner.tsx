import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface RestTimerBannerProps {
  seconds: number;
  onDismiss: () => void;
}

export function RestTimerBanner({ seconds, onDismiss }: RestTimerBannerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          if (navigator.vibrate) navigator.vibrate(300);
          onDismissRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="fixed bottom-20 inset-x-4 z-40 flex items-center justify-between rounded-lg bg-accent px-4 py-3 text-zinc-950 shadow-lg">
      <span className="font-mono text-lg font-semibold">
        {mins}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-sm font-medium">Descanso</span>
      <button type="button" onClick={onDismiss} aria-label="Saltar descanso">
        <X size={20} />
      </button>
    </div>
  );
}
