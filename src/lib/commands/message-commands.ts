import { supabase } from '../supabase/client';
import { startOfDay, endOfDay } from '../utils/date';
import type { Command } from '../../types/command';

export const messageCommands: Record<string, Command> = {
  'mentions-today': {
    name: 'mentions-today',
    description: 'Show messages where you were mentioned today',
    execute: async (userId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .gte('timestamp', startOfDay())
        .lte('timestamp', endOfDay())
        .ilike('content', `%@${userId}%`)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return {
        type: 'messages',
        data: data || [],
        message: 'Messages mentioning you today:'
      };
    }
  },

  'unread': {
    name: 'unread',
    description: 'Show unread messages',
    execute: async (userId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient', userId)
        .eq('read', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return {
        type: 'messages',
        data: data || [],
        message: 'Unread messages:'
      };
    }
  }
};