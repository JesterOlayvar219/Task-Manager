import React from 'react';
import type { ChatMessage } from '../../types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[80%] ${
            message.type === 'command' ? 'ml-0' : 'ml-auto'
          }`}
        >
          <div
            className={`p-3 rounded-lg ${
              message.type === 'command'
                ? 'bg-[#2F2F2F] text-gray-300'
                : 'bg-[#10A37F] text-white'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}