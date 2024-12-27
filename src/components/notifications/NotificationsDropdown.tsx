import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Trash2, X } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Notification } from '../../types/notification';

interface NotificationsDropdownProps {
  notifications: Notification[];
  loading: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function NotificationsDropdown({
  notifications,
  loading,
  buttonRef,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClose,
}: NotificationsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasUnread = notifications.some(n => !n.read);

  useClickOutside(dropdownRef, () => {
    if (!buttonRef.current?.contains(document.activeElement)) {
      onClose();
    }
  });

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50 w-[320px] max-h-[480px] bg-[#2B2D31] rounded-lg shadow-xl border border-gray-800/50 overflow-hidden"
      style={{
        top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 0,
        right: 16
      }}
    >
      <div className="flex items-center justify-between p-3 bg-[#2F3136] border-b border-gray-800/50">
        <h3 className="font-medium text-gray-100">Notifications</h3>
        <div className="flex items-center gap-1">
          {hasUnread && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 text-gray-400 hover:text-[#10A37F] hover:bg-[#10A37F]/10 rounded-md transition-colors"
              title="Mark all as read"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={onClear}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            title="Clear all notifications"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>,
    document.body
  );
}