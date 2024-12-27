import { useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuthContext } from '../../contexts/AuthContext';
import { mapTaskResponse } from '../../lib/supabase/queries/task-mapper';
import type { Task } from '../../types/task';

interface UseTaskSubscriptionProps {
  channelId?: string;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useTaskSubscription({
  channelId,
  setTasks,
  setLoading,
  setError
}: UseTaskSubscriptionProps) {
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = supabase
          .from('task_details')
          .select('*')
          .order('due_date', { ascending: true });

        if (channelId) {
          query.eq('channel_id', channelId);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        
        setTasks((data || []).map(mapTaskResponse));
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    // Subscribe to task changes
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
  }, [channelId, user, setTasks, setLoading, setError]);
}