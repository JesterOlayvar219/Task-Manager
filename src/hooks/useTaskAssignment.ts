import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import type { Task } from '../types/task';

interface UseTaskAssignmentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useTaskAssignment({ onSuccess, onError }: UseTaskAssignmentProps = {}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const assignTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);

      // Get creator's username
      const { data: creatorData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (!creatorData?.username) {
        throw new Error('Creator profile not found');
      }

      // Prepare task data
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        created_by: creatorData.username,
        assignee: taskData.assignee,
        due_date: taskData.dueDate,
        status: taskData.status || 'not-started',
        channel_id: taskData.channelId || null,
        personal_chat_id: taskData.assignee, // Always set personal_chat_id to assignee
        files: taskData.files || []
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      onSuccess?.();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign task';
      onError?.(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    assignTask
  };
}