import type { Task } from '../../types/task';

export function useTaskFilters(tasks: Task[]) {
  const notStartedTasks = tasks.filter(task => task.status === 'not-started');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return {
    notStartedTasks,
    inProgressTasks,
    completedTasks
  };
}