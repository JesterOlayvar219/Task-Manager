import React from 'react';
import { cn } from '../../../lib/utils';
import { formatTime } from '../../../lib/utils/date';
import type { Message } from '../../../types/message';

interface ChannelMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChannelMessage({ message, isOwn }: ChannelMessageProps) {
  return (
    <div className={cn(
      'flex px-4 py-2',
      isOwn ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[70%] space-y-1',
        isOwn ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'flex items-center gap-2',
          isOwn && 'flex-row-reverse'
        )}>
          <span className={cn(
            'font-medium',
            isOwn ? 'text-[#10A37F]' : 'text-white'
          )}>
            {message.sender}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className={cn(
          'px-4 py-2 rounded-lg break-words',
          isOwn ? 'bg-[#10A37F] text-white' : 'bg-gray-700 text-gray-100'
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
}