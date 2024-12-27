import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { usePrivateChats } from '../../../hooks/usePrivateChats';
import { useUnreadMessages } from '../../../hooks/useUnreadMessages';
import { CreateChatDialog } from './CreateChatDialog';
import { PrivateChatItem } from './PrivateChatItem';
import { cn } from '../../../lib/utils';

interface PrivateChatsSectionProps {
  onChatSelect: (chatId: string) => void;
  activeChatId: string | null;
  isCollapsed?: boolean;
}

export function PrivateChatsSection({ 
  onChatSelect, 
  activeChatId,
  isCollapsed = false 
}: PrivateChatsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { chats, loading, error, createChat } = usePrivateChats();
  const { unreadCounts, markAsRead } = useUnreadMessages();

  const handleChatSelect = (chatId: string) => {
    onChatSelect(chatId);
    markAsRead(chatId);
  };

  if (loading) {
    return (
      <div className="p-2">
        <div className="animate-pulse bg-gray-700/50 h-8 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-sm text-red-400">
        Failed to load private chats
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="px-2">
        <button
          onClick={() => setIsDialogOpen(true)}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg transition-colors",
            "text-sm text-gray-400 hover:text-white hover:bg-gray-700/50",
            isCollapsed ? "justify-center p-2" : "px-3 py-2"
          )}
          title={isCollapsed ? "Create New Chat" : undefined}
        >
          <MessageSquarePlus size={16} className="shrink-0" />
          {!isCollapsed && <span>Create New Chat</span>}
        </button>
      </div>

      <div className="space-y-0.5">
        {chats.map((chat) => (
          <PrivateChatItem
            key={chat.id}
            id={chat.id}
            name={chat.name}
            isActive={chat.id === activeChatId}
            unreadCount={unreadCounts[chat.id] || 0}
            onSelect={() => handleChatSelect(chat.id)}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <CreateChatDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={createChat}
      />
    </div>
  );
}