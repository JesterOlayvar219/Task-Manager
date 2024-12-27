import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import { supabase } from '../lib/supabase/client';
import type { Message } from '../types/message';

export function useChannelMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  // Load initial messages
  useEffect(() => {
    if (!channelId || !user) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_type', 'channel')
          .eq('chat_id', channelId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.chat_type === 'channel') {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Send message handler
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !username || !content.trim() || !channelId) return;

    try {
      const message = {
        content: content.trim(),
        sender: username,
        chat_id: channelId,
        chat_type: 'channel' as const,
        is_read: false
      };

      const { error: sendError } = await supabase
        .from('messages')
        .insert([message]);

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      throw err;
    }
  }, [channelId, user, username]);

  return {
    messages,
    loading,
    error,
    isConnected,
    sendMessage
  };
}