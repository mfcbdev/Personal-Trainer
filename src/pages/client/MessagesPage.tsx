import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { MessageThread } from '../../components/messages/MessageThread';
import { useAuth } from '../../contexts/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Mensajes" />
      <Card>
        {user && (
          <MessageThread
            clientId={user.id}
            emptyHint="Aún no hay mensajes. Escríbele a tu entrenador: tus dudas, cómo te sentiste, lo que necesites."
          />
        )}
      </Card>
    </div>
  );
}
