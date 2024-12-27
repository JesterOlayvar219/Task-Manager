import { supabase } from '../supabase/client';
import { startOfDay, endOfDay } from '../utils/date';
import type { Command } from '../../types/command';

export const taskCommands: Record<string, Command> = {
  'tasks-today': {
    name: 'tasks-today',
    description: 'Show tasks due today',
    execute: async (userId) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (!userData?.username) {
          throw new Error('User not found');
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee', userData.username)
          .gte('due_date', startOfDay())
          .lte('due_date', endOfDay())
          .order('due_date', { ascending: true });

        if (error) throw error;

        return {
          type: 'tasks',
          data: data || [],
          message: 'Tasks due today:'
        };
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return {
          type: 'error',
          data: [],
          message: 'Failed to fetch tasks'
        };
      }
    }
  },

  'completed': {
    name: 'completed',
    description: 'Show your completed tasks',
    execute: async (userId) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (!userData?.username) {
          throw new Error('User not found');
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee', userData.username)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          type: 'tasks',
          data: data || [],
          message: 'Your completed tasks:'
        };
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return {
          type: 'error',
          data: [],
          message: 'Failed to fetch tasks'
        };
      }
    }
  },

  'in-progress': {
    name: 'in-progress',
    description: 'Show your tasks in progress',
    execute: async (userId) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (!userData?.username) {
          throw new Error('User not found');
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee', userData.username)
          .eq('status', 'in-progress')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          type: 'tasks',
          data: data || [],
          message: 'Your tasks in progress:'
        };
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return {
          type: 'error',
          data: [],
          message: 'Failed to fetch tasks'
        };
      }
    }
  },

  'all-tasks': {
    name: 'all-tasks',
    description: 'Show all your tasks',
    execute: async (userId) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (!userData?.username) {
          throw new Error('User not found');
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee', userData.username)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          type: 'tasks',
          data: data || [],
          message: 'All your tasks:'
        };
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return {
          type: 'error',
          data: [],
          message: 'Failed to fetch tasks'
        };
      }
    }
  }
};