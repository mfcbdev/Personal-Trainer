import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">Crear cuenta</h1>
        <p className="text-sm text-zinc-400 mb-6">Regístrate como entrenador</p>
        <form className="space-y-3">
          <Input type="text" placeholder="Nombre completo" autoComplete="name" />
          <Input type="email" placeholder="Correo electrónico" autoComplete="email" />
          <Input type="password" placeholder="Contraseña" autoComplete="new-password" />
          <Button type="submit" className="w-full" size="lg">
            Crear cuenta
          </Button>
        </form>
      </Card>
    </div>
  );
}
