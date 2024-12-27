import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const RECONNECT_DELAY = 2000; // 2 seconds

export function useMessageConnection(
  channelId: string,
  onConnectionChange: (isConnected: boolean) => void
) {
  const channelRef = useRef<RealtimeChannel>();
  const reconnectTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!channelId) return;

    const connect = () => {
      // Clean up existing connection
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel(`messages:${channelId}`)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            onConnectionChange(true);
          } else if (status === 'CHANNEL_ERROR') {
            onConnectionChange(false);
            // Attempt reconnection
            reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
          }
        });
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelId, onConnectionChange]);

  return channelRef;
}