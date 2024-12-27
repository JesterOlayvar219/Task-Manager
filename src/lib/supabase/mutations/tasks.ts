import { supabase } from '../client';
import type { Task, TaskStatus } from '../../../types/task';

export async function createTask(taskData: Omit<Task, 'id' | 'created_at'>) {
  // Convert camelCase to snake_case for database
  const data = {
    title: taskData.title,
    description: taskData.description,
    created_by: taskData.createdBy,
    assignee: taskData.assignee,
    due_date: taskData.due_date,
    status: taskData.status || 'not-started',
    channel_id: taskData.channel_id,
    files: taskData.files || [],
  };

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return newTask as Task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) throw error;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  // Convert camelCase to snake_case for database
  const data = {
    ...(updates.title && { title: updates.title }),
    ...(updates.description && { description: updates.description }),
    ...(updates.assignee && { assignee: updates.assignee }),
    ...(updates.due_date && { due_date: updates.due_date }),
    ...(updates.status && { status: updates.status }),
    ...(updates.files && { files: updates.files })
  };

  const { error } = await supabase
    .from('tasks')
    .update(data)
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