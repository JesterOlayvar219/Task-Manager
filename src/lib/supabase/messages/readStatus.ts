import { supabase } from '../client';

export async function markMessagesAsRead(senderId: string, recipientId: string): Promise<void> {
  if (!senderId || !recipientId) return;

  try {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_chat_id: senderId,
      p_recipient: recipientId
    });

    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error in markMessagesAsRead:', err);
    throw err;
  }
}