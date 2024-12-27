import React, { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useNotifications } from '../../hooks/useNotifications';

export function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    loading
  } = useNotifications();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10A37F] text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationsDropdown
          notifications={notifications}
          loading={loading}
          buttonRef={buttonRef}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClear={clearNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}