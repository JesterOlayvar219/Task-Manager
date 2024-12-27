import { supabase } from '../client';
import type { Message } from '../../../types/message';

export async function sendMessage(
  content: string,
  sender: string,
  channelId: string
): Promise<void> {
  if (!content?.trim()) throw new Error('Message content is required');
  if (!sender) throw new Error('Sender is required');
  if (!channelId) throw new Error('Channel ID is required');

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
    throw new Error('Failed to send message');
  }
}

export async function fetchMessages(channelId: string): Promise<Message[]> {
  if (!channelId) throw new Error('Channel ID is required');

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('type', 'channel')
    .eq('channel_id', channelId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }

  return data || [];
}