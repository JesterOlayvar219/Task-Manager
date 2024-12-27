import { useState, useEffect, useCallback } from 'react';
import { onSnapshot } from 'firebase/firestore';
import {
  addNotification as addNotificationToFirestore,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  createNotificationsQuery,
} from '../lib/firebase/services/notifications';
import type { Notification, NotificationType } from '../types/notification';

export function useFirebaseNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = createNotificationsQuery(userId);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const updatedNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(),
        })) as Notification[];
        setNotifications(updatedNotifications);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addNotification = useCallback(async (
    message: string,
    recipient: string,
    type: NotificationType
  ) => {
    try {
      await addNotificationToFirestore({
        message,
        recipient,
        type,
        read: false,
      });
    } catch (err) {
      setError('Failed to add notification');
      throw err;
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}