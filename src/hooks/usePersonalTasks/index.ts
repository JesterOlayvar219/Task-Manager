import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase/client';
import { usePersonalTasksState } from './state';
import { mapTaskResponse } from '../../lib/supabase/queries/task-mapper';
import type { TaskStatus } from '../../types/task';

export function usePersonalTasks() {
  const [state, setState] = usePersonalTasksState();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data, error } = await supabase
          .from('task_details')
          .select('*')
          .eq('assignee', user.id)
          .order('due_date', { ascending: true });

        if (error) throw error;
        
        const tasks = (data || []).map(mapTaskResponse);
        setState(prev => ({ ...prev, tasks, loading: false }));
      } catch (err) {
        console.error('Error loading personal tasks:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load tasks'
        }));
      }
    };

    loadTasks();

    // Subscribe to task changes
    const channel = supabase
      .channel('personal_tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assignee=eq.${user.id}`
        },
        () => loadTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setState]);

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .eq('assignee', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      }));
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    updateTaskStatus
  };
}