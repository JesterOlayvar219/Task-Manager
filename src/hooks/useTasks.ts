import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import { useTaskNotifications } from './useTaskNotifications';
import type { Task } from '../types/task';

export function useTasks(channelId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);
  const { notifyTaskCreated, notifyTaskStatusChanged } = useTaskNotifications();

  const loadTasks = useCallback(async () => {
    if (!user || !username) return;

    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('task_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (channelId) {
        query.eq('channel_id', channelId);
      }

      const { data, error: err } = await query;
      
      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, username, channelId]);

  useEffect(() => {
    loadTasks();

    if (!user || !username) return;

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: channelId ? `channel_id=eq.${channelId}` : undefined
        },
        () => loadTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, username, channelId, loadTasks]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    if (!user || !username) throw new Error('Must be logged in to create tasks');

    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          created_by: username,
          assignee: taskData.assignee,
          due_date: taskData.dueDate,
          status: taskData.status || 'not-started',
          channel_id: taskData.channelId || null,
          files: taskData.files || []
        })
        .select()
        .single();

      if (error) throw error;

      if (newTask) {
        await notifyTaskCreated(newTask as Task, username);
        await loadTasks();
      }

      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw new Error('Failed to create task');
    }
  }, [user, username, loadTasks, notifyTaskCreated]);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    if (!user || !username) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await notifyTaskStatusChanged(task, status, username);
      }

      await loadTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  }, [user, username, tasks, loadTasks, notifyTaskStatusChanged]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user || !username) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [user, username, loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    deleteTask,
    notStartedTasks: tasks.filter(task => task.status === 'not-started'),
    inProgressTasks: tasks.filter(task => task.status === 'in-progress'),
    completedTasks: tasks.filter(task => task.status === 'completed')
  };
}