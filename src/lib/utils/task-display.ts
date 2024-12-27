import { formatDate } from './date';
import type { Task } from '../../types/task';

export function getFormattedTaskDates(task: Task) {
  return {
    dueDate: formatDate(task.due_date || task.dueDate),
    createdDate: formatDate(task.created_at || task.createdAt)
  };
}

export function getTaskUserInfo(task: Task) {
  return {
    creator: task.creator_username || task.createdBy,
    assignee: task.assignee_username || task.assignee
  };
}