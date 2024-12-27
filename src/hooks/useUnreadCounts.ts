import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';

export function useUnreadCounts() {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  useEffect(() => {
    if (!username) return;

    const fetchUnreadCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from('unread_message_counts')
          .select('*')
          .eq('chat_id', username);

        if (err) throw err;

        const counts = (data || []).reduce((acc, { sender, unread_count }) => ({
          ...acc,
          [sender]: parseInt(unread_count as string, 10)
        }), {} as Record<string, number>);

        setUnreadCounts(counts);
      } catch (err) {
        console.error('Error fetching unread counts:', err);
        setError('Failed to fetch unread counts');
      } finally {
        setLoading(false);
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
        p_recipient: username,
        p_sender: senderId
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
    loading,
    error,
    markAsRead
  };
}