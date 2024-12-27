import { supabase } from '../client';
import type { Message } from '../../../types/message';

export async function fetchChannelMessages(channelId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('type', 'channel')
    .eq('channel_id', channelId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendChannelMessage(
  content: string,
  sender: string,
  channelId: string
): Promise<void> {
  const message = {
    content: content.trim(),
    sender,
    recipient: channelId,
    channel_id: channelId,
    type: 'channel',
    timestamp: new Date().toISOString()
  };

  const { error } = await supabase
    .from('messages')
    .insert([message]);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}