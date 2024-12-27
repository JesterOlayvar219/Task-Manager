import { supabase } from '../../client';
import { validateTaskAssignment } from './validation';
import type { Task } from '../../../../types/task';

interface CreateTaskInput {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status?: Task['status'];
  channelId?: string;
  files?: any[];
}

export async function createTask(input: CreateTaskInput, creatorId: string) {
  try {
    // First validate the assignment
    const { creatorUsername, assigneeUsername } = await validateTaskAssignment(
      input.assignee,
      creatorId
    );

    // Then create the task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description,
        created_by: creatorUsername,
        assignee: assigneeUsername,
        due_date: input.dueDate,
        status: input.status || 'not-started',
        channel_id: input.channelId,
        files: input.files || []
      })
      .select('*')
      .single();

    if (error) {
      console.error('Task creation failed:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error creating task:', err);
    throw err;
  }
}