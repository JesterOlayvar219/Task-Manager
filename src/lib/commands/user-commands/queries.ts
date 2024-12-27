import { supabase } from '../../supabase/client';

export async function fetchAllUsers(): Promise<string[]> {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .order('username');

  if (error) throw error;
  return (data || []).map(u => u.username);
}

export function getHelpContent(): string {
  return `Available commands:
/tasks-today - Show tasks due today
/completed - Show your completed tasks
/in-progress - Show tasks in progress
/overdue - Show overdue tasks
/all-tasks - Show all your tasks
/mentions-today - Show mentions
/unread - Show unread messages
/users - Show all users`;
}