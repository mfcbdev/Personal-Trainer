import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SendHorizontal } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useMessages } from '../../hooks/useMessages';
import { cn } from '../../utils/cn';

const MAX_LENGTH = 2000;
const messageSchema = z.object({
  body: z.string().trim().min(1).max(MAX_LENGTH),
});
type MessageInput = z.infer<typeof messageSchema>;

interface MessageThreadProps {
  clientId: string;
  emptyHint: string;
}

export function MessageThread({ clientId, emptyHint }: MessageThreadProps) {
  const { user } = useAuth();
  const { showError } = useToast();
  const { messages, loading, send, markRead } = useMessages(clientId);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<MessageInput>({ resolver: zodResolver(messageSchema), mode: 'onChange', defaultValues: { body: '' } });

  const hasUnreadFromOther = messages.some((m) => m.sender_id !== user?.id && !m.read_at);
  useEffect(() => {
    if (hasUnreadFromOther) void markRead();
  }, [hasUnreadFromOther, markRead]);

  // Keep the newest message in view inside the thread's own scroll box.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function onSubmit({ body }: MessageInput) {
    try {
      await send(body);
      reset({ body: '' });
    } catch {
      showError('No se pudo enviar el mensaje. Revisa tu conexión e inténtalo de nuevo.');
    }
  }

  return (
    <div>
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversación"
        className="max-h-[60vh] overflow-y-auto overscroll-contain space-y-2 mb-4 -mx-1 px-1"
      >
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-1/2 ml-auto" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">{emptyHint}</p>
        ) : (
          messages.map((m) => {
            const own = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cn('flex flex-col', own ? 'items-end' : 'items-start')}>
                <p
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm text-zinc-50 whitespace-pre-wrap break-words',
                    own ? 'bg-accent/15 rounded-br-md' : 'bg-base border border-zinc-800 rounded-bl-md',
                  )}
                >
                  {m.body}
                </p>
                <p className="mt-0.5 px-1 text-[11px] text-zinc-400 tabular-nums">
                  {format(new Date(m.created_at), "d MMM, HH:mm", { locale: es })}
                  {own && <span> · {m.read_at ? 'Visto' : 'Enviado'}</span>}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2" noValidate>
        <label htmlFor={`msg-${clientId}`} className="sr-only">
          Escribe un mensaje
        </label>
        <Input
          id={`msg-${clientId}`}
          autoComplete="off"
          maxLength={MAX_LENGTH}
          placeholder="Escribe un mensaje…"
          {...register('body')}
        />
        <Button
          type="submit"
          aria-label="Enviar mensaje"
          disabled={isSubmitting || !isValid}
          className="w-11 shrink-0 px-0"
        >
          <SendHorizontal size={18} />
        </Button>
      </form>
    </div>
  );
}
