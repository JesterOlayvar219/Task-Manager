import { toISOString } from '../../utils/date';
import type { Task } from '../../../types/task';

export function mapTaskResponse(data: any): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    createdBy: data.created_by,
    assignee: data.assignee,
    dueDate: data.due_date,
    status: data.status || 'not-started',
    channelId: data.channel_id,
    personalChatId: data.personal_chat_id,
    createdAt: data.created_at,
    files: Array.isArray(data.files) ? data.files : [],
    creator_username: data.creator_username,
    assignee_username: data.assignee_username
  };
}

export function mapTaskRequest(task: Partial<Task>) {
  return {
    title: task.title,
    description: task.description,
    created_by: task.createdBy,
    assignee: task.assignee,
    due_date: task.dueDate ? toISOString(task.dueDate) : toISOString(new Date()),
    status: task.status || 'not-started',
    channel_id: task.channelId || null,
    files: task.files || []
  };
}