import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export function usePrivateChatMembers(chatId: string) {
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('private_chat_members')
          .select('user_id')
          .eq('private_chat_id', chatId)
          .order('joined_at', { ascending: true });

        if (err) throw err;
        setMembers((data || []).map(m => m.user_id));
      } catch (err) {
        console.error('Error fetching chat members:', err);
        setError('Failed to load chat members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to member changes
    const channel = supabase.channel(`private_chat_members:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'private_chat_members',
          filter: `private_chat_id=eq.${chatId}`
        },
        () => fetchMembers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return { members, loading, error };
}