import { useState, useCallback } from 'react';
import { addTask, updateTask, deleteTask, getUserTasks, getChannelTasks } from '../lib/firebase/services/tasks';
import type { Task } from '../types/task';

export function useTaskManagement(userId?: string, channelId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!userId && !channelId) return;
    
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = channelId 
        ? await getChannelTasks(channelId)
        : await getUserTasks(userId!);
      setTasks(loadedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId, channelId]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id'>, files?: File[]) => {
    try {
      setError(null);
      const newTask = await addTask(taskData, files);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }, []);

  const updateTaskById = useCallback(async (taskId: string, updates: Partial<Task>, files?: File[]) => {
    try {
      setError(null);
      await updateTask(taskId, updates, files);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  const deleteTaskById = useCallback(async (taskId: string) => {
    try {
      setError(null);
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask: updateTaskById,
    deleteTask: deleteTaskById,
  };
}