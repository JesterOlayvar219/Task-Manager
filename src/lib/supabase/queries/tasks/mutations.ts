import { supabase } from '../../client';
import type { TaskStatus } from '../../../../types/task';

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}