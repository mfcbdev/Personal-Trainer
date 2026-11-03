import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

export type Message = Database['public']['Tables']['messages']['Row'];

/** The alumno ↔ coach thread for one alumno, kept live via Supabase realtime. */
export function useMessages(clientId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    if (!error) setMessages(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    void refetch();
    const channel = supabase
      .channel(`messages:${clientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${clientId}` },
        () => void refetch(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [clientId, refetch]);

  async function send(body: string) {
    if (!clientId || !user) throw new Error('No autenticado');
    const { error } = await supabase.from('messages').insert({ client_id: clientId, sender_id: user.id, body });
    if (error) throw error;
    await refetch();
  }

  // Mark what the other party sent as read; mirror it locally so a later
  // incoming message flips the "has unread" signal again.
  const markRead = useCallback(async () => {
    if (!clientId || !user) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('messages')
      .update({ read_at: now })
      .eq('client_id', clientId)
      .neq('sender_id', user.id)
      .is('read_at', null);
    if (error) return;
    setMessages((prev) => prev.map((m) => (m.sender_id !== user.id && !m.read_at ? { ...m, read_at: now } : m)));
  }, [clientId, user]);

  return { messages, loading, send, markRead };
}

/** Count of messages the other party sent that this user hasn't read yet. */
export function useUnreadMessageCount(clientId: string | undefined) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!clientId || !user) return;
    let cancelled = false;
    void supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .neq('sender_id', user.id)
      .is('read_at', null)
      .then(({ count: unread }) => {
        if (!cancelled) setCount(unread ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, user]);

  return count;
}
