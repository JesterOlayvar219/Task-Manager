import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import type { Message } from '../types/message';

export function useChannelChat(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    // Initial messages fetch
    const fetchMessages = async () => {
      try {
        const { data, error: err } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('timestamp', { ascending: true });

        if (err) throw err;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
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
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, user]);

  const sendMessage = async (content: string) => {
    if (!user) return;

    try {
      const { error: err } = await supabase
        .from('messages')
        .insert({
          content,
          sender: user.id,
          channel_id: channelId,
          timestamp: new Date().toISOString(),
          read: false
        });

      if (err) throw err;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}