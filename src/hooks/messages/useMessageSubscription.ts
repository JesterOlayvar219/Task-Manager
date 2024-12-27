import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import type { Message } from '../../types/message';

export function useMessageSubscription(
  channelId: string,
  onMessage: (message: Message) => void,
  onConnectionChange?: (isConnected: boolean) => void
) {
  const channelRef = useRef<RealtimeChannel>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const subscribe = useCallback(() => {
    if (!channelId) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            onMessage(payload.new as Message);
          }
        }
      )
      .subscribe((status) => {
        const isConnected = status === 'SUBSCRIBED';
        onConnectionChange?.(isConnected);
        
        if (!isConnected) {
          // Attempt reconnection after 2 seconds
          reconnectTimeoutRef.current = setTimeout(subscribe, 2000);
        }
      });
  }, [channelId, onMessage, onConnectionChange]);

  useEffect(() => {
    subscribe();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [subscribe]);
}