import { fetchTodaysMentions, fetchUnreadMessages } from './queries';
import type { Command } from '../../../types/command';

export const messageCommands: Record<string, Command> = {
  'mentions-today': {
    name: 'mentions-today',
    description: 'Show messages where you were mentioned today',
    execute: async (userId) => ({
      type: 'messages',
      data: await fetchTodaysMentions(userId),
      message: 'Messages mentioning you today:'
    })
  },

  'unread': {
    name: 'unread',
    description: 'Show unread messages',
    execute: async (userId) => ({
      type: 'messages',
      data: await fetchUnreadMessages(userId),
      message: 'Unread messages:'
    })
  }
};