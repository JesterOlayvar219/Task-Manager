import React from 'react';
import { ChannelMessageList } from './chat/ChannelMessageList';
import { ChannelChatInput } from './chat/ChannelChatInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUsername } from '../../hooks/useUsername';
import type { Message } from '../../types/message';

interface ChannelChatProps {
  channelId: string;
  channelName: string;
  messages: Message[];
  loading: boolean;
  error: string | null;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChannelChat({ 
  channelId, 
  channelName, 
  messages,
  loading,
  error,
  onSendMessage 
}: ChannelChatProps) {
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  if (!user) return null;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{channelName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChannelMessageList 
          messages={messages}
          currentUser={user.id}
          channelId={channelId}
          username={username}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-auto">
        <ChannelChatInput 
          channelId={channelId}
          username={username}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
}