import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export default function InvitePage() {
  const { token } = useParams();

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <h1 className="font-display text-xl font-semibold mb-2">Invitación</h1>
        <p className="text-sm text-zinc-400">Token: {token}</p>
      </Card>
    </div>
  );
}
