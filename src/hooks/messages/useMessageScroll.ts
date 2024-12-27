import { useRef, useCallback, useEffect } from 'react';
import type { Message } from '../../types/message';

export function useMessageScroll(messages: Message[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);
  const isScrolledToBottomRef = useRef(true);

  const checkIfScrolledToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return true;
    
    const threshold = 100; // pixels from bottom
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    const element = scrollRef.current;
    if (!element) return;

    if (force || isScrolledToBottomRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, []);

  // Handle scroll events
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      isScrolledToBottomRef.current = checkIfScrolledToBottom();
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [checkIfScrolledToBottom]);

  // Handle new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    if (lastMessage.id !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage.id;
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return {
    scrollRef,
    scrollToBottom
  };
}