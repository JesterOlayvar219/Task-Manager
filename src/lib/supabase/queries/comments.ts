import { supabase } from '../client';
import type { TaskComment } from '../../../types/comment';

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from('task_comment_details')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addTaskComment(
  taskId: string,
  author: string,
  content: string
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      author,
      content: content.trim()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}