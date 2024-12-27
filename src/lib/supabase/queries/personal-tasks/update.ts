import { supabase } from '../../client';
import type { TaskStatus } from '../../../../types/task';

export async function updatePersonalTaskStatus(taskId: string, status: TaskStatus) {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}