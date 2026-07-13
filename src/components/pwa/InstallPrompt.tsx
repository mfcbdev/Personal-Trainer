import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'grow-install-dismissed';
const DISMISS_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) return;

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === 'dismissed') dismiss();
  }

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-40 flex items-center gap-3 rounded-lg bg-surface border border-zinc-800 p-3 shadow-lg">
      <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
        <Download size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-50">Instala GROW</p>
        <p className="text-xs text-zinc-400">Acceso rápido desde tu pantalla de inicio.</p>
      </div>
      <button
        type="button"
        onClick={install}
        className="h-9 px-3 rounded-lg bg-accent text-zinc-950 text-sm font-medium"
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Descartar"
        className="h-9 w-9 flex items-center justify-center text-zinc-500"
      >
        <X size={16} />
      </button>
    </div>
  );
}
