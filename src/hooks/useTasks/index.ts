import { useState } from 'react';
import { useTaskSubscription } from './useTaskSubscription';
import { useTaskOperations } from './useTaskOperations';
import { useTaskFilters } from './useTaskFilters';
import type { Task } from '../../types/task';

export function useTasks(channelId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to task changes
  useTaskSubscription({ channelId, setTasks, setLoading, setError });

  // Task CRUD operations
  const { addTask, updateTaskStatus, deleteTask } = useTaskOperations({
    channelId,
    setTasks
  });

  // Task filtering
  const { notStartedTasks, inProgressTasks, completedTasks } = useTaskFilters(tasks);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    deleteTask,
    notStartedTasks,
    inProgressTasks,
    completedTasks
  };
}