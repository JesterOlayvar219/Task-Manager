import React from 'react';
import { MessageSquare } from 'lucide-react';
import { PrivateChatBadge } from './PrivateChatBadge';
import { cn } from '../../../lib/utils';

interface PrivateChatItemProps {
  id: string;
  name: string;
  isActive: boolean;
  unreadCount: number;
  onSelect: () => void;
  isCollapsed?: boolean;
}

export function PrivateChatItem({
  name,
  isActive,
  unreadCount,
  onSelect,
  isCollapsed = false
}: PrivateChatItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full px-3 py-2 flex items-center gap-2 rounded-lg transition-colors relative",
        "hover:bg-gray-700/50",
        isActive && "bg-gray-700 text-white",
        isCollapsed && "justify-center"
      )}
      title={isCollapsed ? name : undefined}
    >
      <MessageSquare size={16} className="shrink-0" />
      {!isCollapsed && (
        <span className="flex-1 truncate text-left">{name}</span>
      )}
      {unreadCount > 0 && (
        <PrivateChatBadge count={unreadCount} />
      )}
    </button>
  );
}