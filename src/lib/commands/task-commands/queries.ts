import { supabase } from '../../supabase/client';
import { startOfDay, endOfDay } from '../../utils/date';
import type { Task } from '../../../types/task';

export async function fetchTodaysTasks(userId: string): Promise<Task[]> {
  // Get user's username
  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (!userData?.username) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('assignee', userData.username)
    .gte('due_date', startOfDay())
    .lte('due_date', endOfDay())
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchTasksByStatus(userId: string, status: Task['status']): Promise<Task[]> {
  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (!userData?.username) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('assignee', userData.username)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchOverdueTasks(userId: string): Promise<Task[]> {
  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (!userData?.username) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('assignee', userData.username)
    .lt('due_date', startOfDay())
    .neq('status', 'completed')
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchAllTasks(userId: string): Promise<Task[]> {
  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (!userData?.username) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('assignee', userData.username)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}