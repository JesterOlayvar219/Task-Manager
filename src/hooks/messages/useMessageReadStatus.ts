import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Message } from '../../types/message';

export function useMessageReadStatus(channelId: string) {
  const [readStatus, setReadStatus] = useState<Record<string, string[]>>({});

  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      if (error) throw error;

      setReadStatus(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), ...messageIds]
      }));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [channelId]);

  return {
    readStatus,
    markAsRead
  };
}