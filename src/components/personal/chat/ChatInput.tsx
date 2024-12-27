import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useCommandMenu } from '../../../hooks/useCommandMenu';
import { CommandMenu } from './CommandMenu';
import { CommandResult } from './CommandResult';
import { cn } from '../../../lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isOpen, commands, result, handleCommand, handleInput, closeMenu } = useCommandMenu();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    try {
      setSubmitting(true);
      if (content.startsWith('/')) {
        await handleCommand(content);
      } else {
        await onSendMessage(content);
      }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    handleInput(value);
  };

  return (
    <div className="relative">
      {result && (
        <div className="p-4 border-t border-gray-700">
          <CommandResult result={result} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              placeholder="Type a message or use / for commands..."
              className={cn(
                "w-full min-h-[44px] max-h-[120px] px-3 py-2",
                "bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:border-[#10A37F]",
                "resize-none",
                submitting && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />
            {isOpen && (
              <CommandMenu
                commands={commands}
                onSelect={handleCommand}
                onClose={closeMenu}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className={cn(
              "p-2 text-gray-400 hover:text-white transition-colors rounded-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}