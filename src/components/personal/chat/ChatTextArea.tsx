import React, { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

interface ChatTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      placeholder="Type a message or use '/' for commands"
      className={cn(
        "flex-1 min-h-[44px] max-h-[200px] px-3 py-2",
        "bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
        "text-white placeholder-gray-400",
        "focus:outline-none focus:border-[#10A37F]",
        "resize-none",
        className
      )}
      rows={1}
      {...props}
    />
  )
);