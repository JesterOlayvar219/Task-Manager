import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { cn } from '../../../lib/utils';
import type { Message } from '../../../types/message';

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  className?: string;
}

export function MessageList({ messages, currentUser, className }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender === currentUser}
                username={message.sender}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}