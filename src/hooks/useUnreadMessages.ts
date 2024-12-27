import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';

export function useUnreadMessages() {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  useEffect(() => {
    if (!username) return;

    const fetchUnreadCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('unread_message_counts')
          .select('chat_id, sender, unread_count')
          .eq('chat_id', username);

        if (error) throw error;

        const counts = (data || []).reduce((acc, { sender, unread_count }) => ({
          ...acc,
          [sender]: parseInt(unread_count as string, 10)
        }), {} as Record<string, number>);

        setUnreadCounts(counts);
      } catch (err) {
        console.error('Error fetching unread counts:', err);
      }
    };

    fetchUnreadCounts();

    // Subscribe to message changes
    const channel = supabase.channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${username}`
        },
        () => fetchUnreadCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const markAsRead = async (senderId: string) => {
    if (!username) return;

    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_sender: senderId,
        p_recipient: username
      });

      if (error) throw error;

      setUnreadCounts(prev => ({
        ...prev,
        [senderId]: 0
      }));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return {
    unreadCounts,
    markAsRead
  };
}