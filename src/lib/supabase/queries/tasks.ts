import { supabase } from '../client';
import { toISOString } from '../../utils/date';
import { mapTaskResponse } from './task-mapper';
import type { Task } from '../../../types/task';

export async function fetchTasks(channelId: string) {
  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTaskResponse);
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: taskData.title,
      description: taskData.description,
      created_by: taskData.createdBy,
      assignee: taskData.assignee,
      due_date: toISOString(taskData.dueDate),
      status: taskData.status || 'not-started',
      channel_id: taskData.channelId,
      files: taskData.files || []
    }])
    .select()
    .single();

  if (error) throw error;
  return mapTaskResponse(data);
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
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