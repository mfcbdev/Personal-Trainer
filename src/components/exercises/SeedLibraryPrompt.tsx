import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';

interface SeedLibraryPromptProps {
  onSeed: () => Promise<void>;
}

export function SeedLibraryPrompt({ onSeed }: SeedLibraryPromptProps) {
  const { showError, showSuccess } = useToast();
  const [seeding, setSeeding] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    try {
      await onSeed();
      showSuccess('Biblioteca de ejercicios importada.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo importar la biblioteca.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <Card className="text-center">
      <h2 className="font-display text-base font-semibold mb-1">Aún no tienes ejercicios</h2>
      <p className="text-sm text-zinc-400 mb-4">
        Importa la biblioteca predeterminada de 218 ejercicios y personalízala a tu gusto.
      </p>
      <Button type="button" onClick={handleSeed} disabled={seeding} className="w-full sm:w-auto">
        {seeding ? 'Importando...' : 'Importar biblioteca predeterminada'}
      </Button>
    </Card>
  );
}
