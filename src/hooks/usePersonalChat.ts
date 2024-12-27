import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import type { Message } from '../types/message';

export function usePersonalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  // Load initial messages
  useEffect(() => {
    if (!user || !username) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_type', 'private')
          .eq('chat_id', username)
          .eq('sender', username)
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

    // Subscribe to new messages
    const channel = supabase
      .channel(`private_messages:${username}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${username}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.chat_type === 'private') {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, username]);

  // Send message handler
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !username || !content.trim()) {
      throw new Error('Missing required data for sending message');
    }

    try {
      const message = {
        content: content.trim(),
        sender: username,
        chat_id: username,
        chat_type: 'private' as const,
        is_read: false
      };

      const { error: sendError } = await supabase
        .from('messages')
        .insert([message]);

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [user, username]);

  return {
    messages,
    loading,
    error,
    sendMessage
  };
}