import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import type { Message } from '../types/message';

export function usePrivateChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  // Load initial messages
  useEffect(() => {
    if (!chatId || !username) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('private_chat_messages')
          .select('*')
          .eq('private_chat_id', chatId)
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
      .channel(`private_chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_chat_messages',
          filter: `private_chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, username]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !username || !content.trim() || !chatId) return;

    try {
      const { error: sendError } = await supabase
        .from('private_chat_messages')
        .insert({
          private_chat_id: chatId,
          sender: username,
          content: content.trim()
        });

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [chatId, user, username]);

  return {
    messages,
    loading,
    error,
    sendMessage
  };
}