import { supabase } from '../../supabase/client';
import { startOfDay, endOfDay } from '../../utils/date';
import type { Message } from '../../../types/message';

export async function fetchTodaysMentions(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .gte('timestamp', startOfDay())
    .lte('timestamp', endOfDay())
    .ilike('content', `%@${userId}%`)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchUnreadMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient', userId)
    .eq('read', false)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}