import { supabase } from '../client';
import type { Message } from '../../../types/message';

export async function getChannelMessages(channelId: string) {
  const { data, error } = await supabase
    .from('channel_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function getPersonalMessages(userId: string, otherUserId: string) {
  const participants = [userId, otherUserId].sort();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .contains('participants', participants)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function getUnreadMessages(userId: string) {
  const [{ data: personalMessages }, { data: channelMessages }] = await Promise.all([
    supabase
      .from('messages')
      .select('*')
      .eq('recipient', userId)
      .eq('read', false),
    supabase
      .from('channel_messages')
      .select('*')
      .eq('read', false)
  ]);

  return [...(personalMessages || []), ...(channelMessages || [])] as Message[];
}