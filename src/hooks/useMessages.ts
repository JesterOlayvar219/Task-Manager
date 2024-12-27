import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { Message } from '../types/message';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (content: string, sender: string, recipient: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content,
          sender,
          recipient,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'channel'
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      if (error) throw error;

      setMessages(prev =>
        prev.map(message =>
          messageIds.includes(message.id)
            ? { ...message, read: true }
            : message
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
      throw err;
    }
  };

  return {
    messages,
    sendMessage,
    markAsRead,
  };
}