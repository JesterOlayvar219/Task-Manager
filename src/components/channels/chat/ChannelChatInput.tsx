import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useTypingIndicator } from '../../../hooks/useTypingIndicator';
import { cn } from '../../../lib/utils';

interface ChannelChatInputProps {
  channelId: string;
  username: string | null;
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChannelChatInput({ 
  channelId, 
  username, 
  onSendMessage, 
  disabled 
}: ChannelChatInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { broadcastTyping } = useTypingIndicator(channelId, username);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || submitting) return;

    try {
      setSubmitting(true);
      await onSendMessage(content);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Broadcast typing status when content changes
    if (value.trim()) {
      broadcastTyping().catch(console.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || submitting}
        placeholder="Type a message..."
        className={cn(
          "flex-1 min-h-[44px] max-h-[120px] px-3 py-2",
          "bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
          "text-white placeholder-gray-400",
          "focus:outline-none focus:border-[#10A37F]",
          "resize-none",
          (disabled || submitting) && "opacity-50 cursor-not-allowed"
        )}
        rows={1}
      />
      <button
        type="submit"
        disabled={!content.trim() || disabled || submitting}
        className={cn(
          "p-2 text-gray-400 hover:text-white transition-colors rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Send size={20} />
      </button>
    </form>
  );
}