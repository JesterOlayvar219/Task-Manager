import React from 'react';

interface TypingIndicatorProps {
  username: string;
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
      <div className="flex gap-1">
        <span 
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" 
          style={{ animationDelay: '0ms', animationDuration: '600ms' }} 
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" 
          style={{ animationDelay: '150ms', animationDuration: '600ms' }} 
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" 
          style={{ animationDelay: '300ms', animationDuration: '600ms' }} 
        />
      </div>
      <span>{username} is typing...</span>
    </div>
  );
}