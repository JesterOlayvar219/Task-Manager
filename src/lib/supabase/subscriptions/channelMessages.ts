import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../client';
import type { Message } from '../../../types/message';

export function subscribeToChannelMessages(
  channelId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel {
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
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to channel messages');
      } else {
        console.error('Failed to subscribe to channel messages:', status);
      }
    });
}