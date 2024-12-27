import React, { useEffect, useRef } from 'react';
import { ChannelMessage } from './ChannelMessage';
import { TypingIndicator } from './TypingIndicator';
import { useTypingIndicator } from '../../../hooks/useTypingIndicator';
import type { Message } from '../../../types/message';

interface ChannelMessageListProps {
  messages: Message[];
  currentUser: string;
  channelId: string;
  username: string | null;
}

export function ChannelMessageList({ 
  messages, 
  currentUser, 
  channelId,
  username 
}: ChannelMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { typingUsers } = useTypingIndicator(channelId, username);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll on new messages or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Scroll on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChannelMessage
              key={message.id}
              message={message}
              isOwn={message.sender === username}
            />
          ))
        )}
        {typingUsers.map(user => (
          <TypingIndicator key={user} username={user} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}