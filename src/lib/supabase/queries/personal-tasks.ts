import { supabase } from '../client';
import { mapTaskResponse } from './task-mapper';
import type { Task } from '../../../types/task';

export async function fetchAssignedTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      created_by,
      assignee,
      due_date,
      status,
      channel_id,
      created_at,
      files
    `)
    .eq('assignee', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assigned tasks:', error);
    throw error;
  }

  return (data || []).map(mapTaskResponse);
}