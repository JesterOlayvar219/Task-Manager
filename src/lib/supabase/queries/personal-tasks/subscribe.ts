import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../client';

export function subscribeToPersonalTasks(
  userId: string,
  onTasksChange: () => void
): RealtimeChannel {
  return supabase
    .channel('personal_tasks')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assignee=eq.${userId}`
      },
      onTasksChange
    )
    .subscribe();
}