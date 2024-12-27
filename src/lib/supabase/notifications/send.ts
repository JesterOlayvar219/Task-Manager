import { supabase } from '../client';
import { formatNotificationMessage } from './format';
import type { NotificationAction, NotificationData, NotificationPayload } from './types';

export async function sendNotification(
  recipient: string,
  action: NotificationAction,
  data: NotificationData
): Promise<void> {
  try {
    const message = formatNotificationMessage(action, data);

    const payload: NotificationPayload = {
      type: action,
      message,
      recipient,
      task_id: data.taskId,
      comment_id: data.commentId,
      timestamp: new Date().toISOString(),
      read: false
    };

    const { error } = await supabase
      .from('notifications')
      .insert([payload]);

    if (error) {
      console.error('Error inserting notification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}