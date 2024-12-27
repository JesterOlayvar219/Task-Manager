import { supabase } from '../supabase/client';
import type { Command } from '../../types/command';

export const userCommands: Record<string, Command> = {
  'users': {
    name: 'users',
    description: 'Show all users',
    execute: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .order('username');

        if (error) throw error;

        return {
          type: 'users',
          data: (data || []).map(u => u.username),
          message: 'Available users:'
        };
      } catch (err) {
        console.error('Error fetching users:', err);
        return {
          type: 'error',
          data: [],
          message: 'Failed to fetch users'
        };
      }
    }
  },

  'help': {
    name: 'help',
    description: 'Show available commands',
    execute: async () => {
      return {
        type: 'messages',
        data: [{
          id: 'help',
          content: `Available commands:
/tasks-today - Show tasks due today
/completed - Show your completed tasks
/in-progress - Show tasks in progress
/overdue - Show overdue tasks
/all-tasks - Show all your tasks
/mentions-today - Show mentions
/unread - Show unread messages
/users - Show all users`,
          timestamp: new Date().toISOString()
        }],
        message: 'Command Help'
      };
    }
  }
};