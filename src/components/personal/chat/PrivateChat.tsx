import React from 'react';
import { PrivateChatHeader } from './PrivateChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { usePrivateChat } from '../../../hooks/usePrivateChat';
import { usePrivateChatMembers } from '../../../hooks/usePrivateChatMembers';
import { useAuthContext } from '../../../contexts/AuthContext';

interface PrivateChatProps {
  chatId: string;
  chatName: string;
}

export function PrivateChat({ chatId, chatName }: PrivateChatProps) {
  const { user } = useAuthContext();
  const { messages, loading, error, sendMessage } = usePrivateChat(chatId);
  const { members, loading: membersLoading } = usePrivateChatMembers(chatId);

  if (!user) return null;

  if (loading || membersLoading) {
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
      <PrivateChatHeader 
        chat={{ id: chatId, name: chatName, creator_id: '', is_hidden: false, created_at: '' }}
        members={members}
      />

      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          currentUser={user.id}
        />
      </div>

      <div className="flex-shrink-0 border-t border-gray-700">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}