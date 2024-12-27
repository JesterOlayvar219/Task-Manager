import { supabase } from '../client';
import type { Message } from '../../../types/message';

export async function sendChannelMessage(
  content: string,
  sender: string,
  channelId: string
) {
  const { data, error } = await supabase
    .from('channel_messages')
    .insert([{
      content,
      sender,
      channel_id: channelId,
      timestamp: new Date().toISOString(),
      read: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function sendPersonalMessage(
  content: string,
  sender: string,
  recipient: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      content,
      sender,
      recipient,
      type: 'personal',
      participants: [sender, recipient].sort(),
      timestamp: new Date().toISOString(),
      read: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function markMessagesAsRead(messageIds: string[]) {
  // Update both tables
  await Promise.all([
    supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds),
    supabase
      .from('channel_messages')
      .update({ read: true })
      .in('id', messageIds)
  ]);
}