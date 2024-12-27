import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearReadNotifications
} from '../lib/supabase/notifications/queries';
import type { Notification } from '../types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  useEffect(() => {
    if (!username) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotifications(username);
        setNotifications(data);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient=eq.${username}`
        },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!username) return;

    try {
      await markAllNotificationsAsRead(username);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const clearNotifications = async () => {
    if (!username) return;

    try {
      await clearReadNotifications(username);
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
}