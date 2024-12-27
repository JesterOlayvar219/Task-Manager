import { useState, useCallback } from 'react';
import type { Message } from '../../types/message';

export function useMessageState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const setInitialMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  return {
    messages,
    loading,
    error,
    isConnected,
    setLoading,
    setError,
    setIsConnected,
    addMessage,
    setInitialMessages
  };
}