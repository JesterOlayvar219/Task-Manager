import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { validateTaskStatus } from '../lib/utils/task';
import { useTaskFiles } from './useTaskFiles';
import { useTaskNotifications } from './useTaskNotifications';
import type { Task } from '../types/task';

export function usePersonalTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuthContext();
  const { deleteFile } = useTaskFiles();
  const { notifyTaskStatusChanged } = useTaskNotifications();

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's username
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user?.id)
        .single();

      if (!userData?.username) {
        throw new Error('User profile not found');
      }

      // Get tasks assigned to user OR created by user
      const { data, error: err } = await supabase
        .from('task_details')
        .select('*')
        .or(`assignee.eq.${userData.username},created_by.eq.${userData.username}`)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading personal tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTasks();

    // Subscribe to task changes
    const channel = supabase
      .channel('personal_tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => loadTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateTaskStatus = async (taskId: string, newStatus: unknown) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      setUpdating(true);
      setError(null);

      const validatedStatus = validateTaskStatus(newStatus);

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: validatedStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Get task details for notification
      const task = tasks.find(t => t.id === taskId);
      if (task && user) {
        // Get username for notification
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (userData?.username) {
          await notifyTaskStatusChanged(task, validatedStatus, userData.username);
        }
      }

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: validatedStatus } : task
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task status';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      setUpdating(true);
      setError(null);

      // Get task files before deletion
      const task = tasks.find(t => t.id === taskId);
      if (task?.files?.length) {
        // Delete each file from storage
        for (const file of task.files) {
          try {
            await deleteFile(taskId, file.url);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }
      }

      // Delete task from database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    updating,
    updateTaskStatus,
    deleteTask
  };
}