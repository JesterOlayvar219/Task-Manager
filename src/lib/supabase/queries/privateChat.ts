import { supabase } from '../client';

export async function fetchUnreadCounts(username: string) {
  const { data, error } = await supabase
    .from('private_chat_messages')
    .select('private_chat_id, count(*)')
    .eq('is_read', false)
    .neq('sender', username)
    .group_by('private_chat_id');

  if (error) {
    console.error('Error fetching unread counts:', error);
    throw error;
  }

  return (data || []).reduce((acc, { private_chat_id, count }) => ({
    ...acc,
    [private_chat_id]: parseInt(count as string, 10)
  }), {} as Record<string, number>);
}

export async function markMessagesAsRead(chatId: string, username: string) {
  const { error } = await supabase
    .from('private_chat_messages')
    .update({ is_read: true })
    .eq('private_chat_id', chatId)
    .eq('is_read', false)
    .neq('sender', username);

  if (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}