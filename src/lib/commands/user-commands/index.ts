import { fetchAllUsers, getHelpContent } from './queries';
import type { Command } from '../../../types/command';

export const userCommands: Record<string, Command> = {
  'users': {
    name: 'users',
    description: 'Show all users',
    execute: async () => ({
      type: 'users',
      data: await fetchAllUsers(),
      message: 'Available users:'
    })
  },

  'help': {
    name: 'help',
    description: 'Show available commands',
    execute: async () => ({
      type: 'messages',
      data: [{
        id: 'help',
        content: getHelpContent(),
        timestamp: new Date().toISOString()
      }],
      message: 'Command Help'
    })
  }
};