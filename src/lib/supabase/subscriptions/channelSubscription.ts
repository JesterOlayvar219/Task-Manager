import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../client';
import type { Message } from '../../../types/message';

interface ChannelSubscriptionHandlers {
  onMessage: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function createChannelSubscription(
  channelId: string,
  handlers: ChannelSubscriptionHandlers
): RealtimeChannel {
  if (!channelId) {
    throw new Error('Channel ID is required');
  }

  const channel = supabase.channel(`messages:${channelId}`);

  channel
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
          if (!payload?.new) {
            return; // Silently ignore invalid payloads
          }
          
          const message = payload.new as Message;
          if (!message.content || !message.sender) {
            return; // Silently ignore invalid messages
          }

          handlers.onMessage(message);
        } catch (err) {
          // Only report critical errors
          if (err instanceof Error && err.message !== 'Connection closed') {
            handlers.onError?.(err);
          }
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to message stream');
      } else if (status === 'CHANNEL_ERROR') {
        handlers.onError?.(new Error('Channel connection error'));
      }
      // Ignore other status updates to prevent error spam
    });

  return channel;
}