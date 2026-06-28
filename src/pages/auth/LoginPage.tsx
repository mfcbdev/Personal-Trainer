import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">GROW</h1>
        <p className="text-sm text-zinc-400 mb-6">Inicia sesión en tu cuenta</p>
        <form className="space-y-3">
          <Input type="email" placeholder="Correo electrónico" autoComplete="email" />
          <Input type="password" placeholder="Contraseña" autoComplete="current-password" />
          <Button type="submit" className="w-full" size="lg">
            Iniciar sesión
          </Button>
        </form>
      </Card>
    </div>
  );
}
