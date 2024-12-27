import { supabase } from '../client';
import type { Message } from '../../../types/message';

export async function sendChannelMessage(
  content: string,
  sender: string,
  channelId: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      content,
      sender,
      type: 'channel',
      channel_id: channelId,
      timestamp: new Date().toISOString(),
      read: false,
      recipient: channelId // Use channelId as recipient for channel messages
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
  const participants = [sender, recipient].sort();
  
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      content,
      sender,
      recipient,
      type: 'personal',
      participants,
      timestamp: new Date().toISOString(),
      read: false
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}