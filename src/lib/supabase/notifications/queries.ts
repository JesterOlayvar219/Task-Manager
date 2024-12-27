import { supabase } from '../client';
import type { Notification } from '../../../types/notification';

export async function fetchNotifications(username: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient', username)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  } catch (err) {
    console.error('Error fetching notifications:', err);
    throw err;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(username: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('recipient', username)
    .eq('read', false);

  if (error) throw error;
}

export async function clearReadNotifications(username: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('recipient', username)
    .eq('read', true);

  if (error) throw error;
}