import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function TrainerSettings() {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  const inviteLink = user ? `${window.location.origin}/invite/${user.id}` : '';

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showSuccess('Enlace copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader title="Ajustes" />
      <Card>
        <h2 className="font-display text-base font-semibold mb-1">Invitar cliente</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Comparte este enlace con tu cliente para que cree su cuenta vinculada a la tuya.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={inviteLink}
            className="h-11 flex-1 rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-300 truncate"
          />
          <Button type="button" onClick={copyInviteLink}>
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
