import { useState, useRef, useEffect } from 'react';

interface UseChatInputProps {
  onSendMessage: (message: string) => void;
  onCommandTrigger: () => void;
  onCommandClose: () => void;
}

export function useChatInput({ onSendMessage, onCommandTrigger, onCommandClose }: UseChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }

    if (value.startsWith('/')) {
      onCommandTrigger();
    } else {
      onCommandClose();
    }
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (!message && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [message]);

  return {
    message,
    handleSubmit,
    handleChange,
    handleKeyDown,
    inputRef,
  };
}