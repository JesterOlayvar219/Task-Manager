import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../client';
import type { Message } from '../../../types/message';

interface MessageSubscriptionOptions {
  channelId: string;
  onNewMessage: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function createMessageSubscription({
  channelId,
  onNewMessage,
  onError
}: MessageSubscriptionOptions): RealtimeChannel {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => {
        try {
          onNewMessage(payload.new as Message);
        } catch (err) {
          onError?.(err as Error);
        }
      }
    )
    .subscribe();
}