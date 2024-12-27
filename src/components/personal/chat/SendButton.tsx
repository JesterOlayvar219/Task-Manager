import React from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SendButtonProps {
  disabled?: boolean;
  className?: string;
}

export function SendButton({ disabled, className }: SendButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "p-2 text-gray-400 hover:text-white transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-[#10A37F] focus:ring-opacity-50",
        className
      )}
      aria-label="Send message"
    >
      <Send size={20} />
    </button>
  );
}