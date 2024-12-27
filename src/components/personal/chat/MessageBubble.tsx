import React from 'react';
import { cn } from '../../../lib/utils';
import { formatTime } from '../../../lib/utils/date';
import type { Message } from '../../../types/message';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  username: string;
}

export function MessageBubble({ message, isOwn, username }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[70%]">
        <div className={cn(
          'flex items-center gap-2 mb-1',
          isOwn && 'flex-row-reverse'
        )}>
          <span className={cn(
            'text-sm font-medium',
            isOwn ? 'text-[#10A37F]' : 'text-gray-300'
          )}>
            {isOwn ? 'You' : username}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
        </div>
        <div className={cn(
          'px-4 py-2 rounded-lg',
          isOwn ? 'bg-[#10A37F] text-white' : 'bg-gray-700 text-gray-100'
        )}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}