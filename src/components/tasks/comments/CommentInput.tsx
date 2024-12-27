import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function CommentInput({ onSubmit, disabled }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on content with max height
    const maxHeight = 120;
    const scrollHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${scrollHeight}px`;
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(content);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px'; // Reset to initial height
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || submitting}
          placeholder="Write a comment... (Press Enter to send)"
          className={cn(
            "w-full min-h-[36px] max-h-[120px] px-3 py-2",
            "bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
            "text-sm text-white placeholder-gray-400",
            "focus:outline-none focus:border-[#10A37F]",
            "resize-none",
            (disabled || submitting) && "opacity-50 cursor-not-allowed"
          )}
          style={{ height: '36px' }} // Initial height
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || disabled || submitting}
        className={cn(
          "p-2 text-gray-400 hover:text-white transition-colors rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Send size={16} />
      </button>
    </form>
  );
}