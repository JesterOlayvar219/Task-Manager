import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatTime } from '../../lib/utils/date';
import type { Notification } from '../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <div
      className={cn(
        'group p-3 border-b border-gray-800/50 hover:bg-[#2F3136] transition-colors',
        !notification.read && 'bg-[#10A37F]/5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            notification.read ? "text-gray-300" : "text-gray-100"
          )}>
            {notification.message}
          </p>
          {notification.task_title && (
            <p className="mt-1 text-xs text-gray-400">
              Task: {notification.task_title}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {formatTime(notification.timestamp)}
          </div>
        </div>
        
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className={cn(
              "p-1.5 rounded-md transition-colors shrink-0",
              "text-gray-400 hover:text-[#10A37F] hover:bg-[#10A37F]/10",
              "opacity-0 group-hover:opacity-100"
            )}
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
}