import { 
  fetchTodaysTasks,
  fetchTasksByStatus,
  fetchOverdueTasks,
  fetchAllTasks
} from './queries';
import type { Command } from '../../../types/command';

export const taskCommands: Record<string, Command> = {
  'tasks-today': {
    name: 'tasks-today',
    description: 'Show tasks due today',
    execute: async (userId) => ({
      type: 'tasks',
      data: await fetchTodaysTasks(userId),
      message: 'Tasks due today:'
    })
  },

  'completed': {
    name: 'completed',
    description: 'Show your completed tasks',
    execute: async (userId) => ({
      type: 'tasks',
      data: await fetchTasksByStatus(userId, 'completed'),
      message: 'Your completed tasks:'
    })
  },

  'in-progress': {
    name: 'in-progress',
    description: 'Show your tasks in progress',
    execute: async (userId) => ({
      type: 'tasks',
      data: await fetchTasksByStatus(userId, 'in-progress'),
      message: 'Your tasks in progress:'
    })
  },

  'overdue': {
    name: 'overdue',
    description: 'Show your overdue tasks',
    execute: async (userId) => ({
      type: 'tasks',
      data: await fetchOverdueTasks(userId),
      message: 'Your overdue tasks:'
    })
  },

  'all-tasks': {
    name: 'all-tasks',
    description: 'Show all your assigned tasks',
    execute: async (userId) => ({
      type: 'tasks',
      data: await fetchAllTasks(userId),
      message: 'All your assigned tasks:'
    })
  }
};