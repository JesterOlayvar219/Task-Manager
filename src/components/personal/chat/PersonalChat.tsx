import React from 'react';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { usePersonalChat } from '../../../hooks/usePersonalChat';
import { useAuthContext } from '../../../contexts/AuthContext';

export function PersonalChat() {
  const { user } = useAuthContext();
  const { messages, loading, error, sendMessage } = usePersonalChat();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Personal Notes</h2>
        <p className="text-sm text-gray-400">Keep track of your thoughts and reminders</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          currentUser={user.id}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-auto border-t border-gray-700">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}