import React from 'react';
import { Users } from 'lucide-react';
import { PrivateChatMembers } from './PrivateChatMembers';
import type { PrivateChat } from '../../../types/privateChat';

interface PrivateChatHeaderProps {
  chat: PrivateChat;
  members: string[];
}

export function PrivateChatHeader({ chat, members }: PrivateChatHeaderProps) {
  return (
    <div className="flex-shrink-0 p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">{chat.name}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
            <Users size={14} />
            <span>{members.length} members</span>
          </div>
        </div>
        <PrivateChatMembers members={members} />
      </div>
    </div>
  );
}