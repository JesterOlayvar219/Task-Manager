import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ChatUser } from '../../../types/message';

interface ChatHeaderProps {
  user: ChatUser;
  showTasks: boolean;
  onToggleTasks: () => void;
}

export function ChatHeader({ user, showTasks, onToggleTasks }: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <User size={16} className="text-gray-400" />
          </div>
        )}
        <div>
          <h2 className="font-medium">{user.username}</h2>
          <p className="text-sm text-gray-400">{user.role}</p>
        </div>
      </div>

      <button
        onClick={onToggleTasks}
        className={cn(
          "p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors",
          "flex items-center gap-2"
        )}
      >
        <span className="text-sm">Tasks</span>
        {showTasks ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}