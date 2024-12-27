import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { getChannelMessages, getPersonalMessages } from '../lib/supabase/queries/chat';
import { sendChannelMessage, sendPersonalMessage } from '../lib/supabase/mutations/chat';
import type { Message } from '../types/message';

export function useChat(channelId?: string, otherUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId && !otherUserId) return;

    setLoading(true);
    
    // Initial messages fetch
    const fetchMessages = async () => {
      try {
        const data = channelId 
          ? await getChannelMessages(channelId)
          : await getPersonalMessages(otherUserId!, otherUserId!);
        
        setMessages(data);
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
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: channelId 
            ? `channel_id=eq.${channelId}` 
            : `type=eq.personal`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, otherUserId]);

  const sendNewMessage = async (content: string, sender: string) => {
    try {
      if (channelId) {
        await sendChannelMessage(content, sender, channelId);
      } else if (otherUserId) {
        await sendPersonalMessage(content, sender, otherUserId);
      }
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
    sendMessage: sendNewMessage,
  };
}