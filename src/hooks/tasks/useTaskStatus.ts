import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { validateTaskStatus } from '../../lib/utils/task';
import type { Task } from '../../types/task';

export function useTaskStatus() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      setUpdating(true);
      setError(null);
      
      // Validate status before update
      const validatedStatus = validateTaskStatus(newStatus);

      // Update the task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: validatedStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;

      return validatedStatus;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task status';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    error,
    updateTaskStatus
  };
}