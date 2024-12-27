import { useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Message } from '../../types/message';

export function useMessageListener(
  channelRef: React.MutableRefObject<RealtimeChannel | undefined>,
  onMessage: (message: Message) => void
) {
  const setupListener = useCallback(() => {
    if (!channelRef.current) return;

    channelRef.current.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        const message = payload.new as Message;
        if (message?.content && message?.sender) {
          onMessage(message);
        }
      }
    );
  }, [channelRef, onMessage]);

  return setupListener;
}