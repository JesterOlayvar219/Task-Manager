import type { NotificationAction, NotificationData } from './types';

export function formatNotificationMessage(action: NotificationAction, data: NotificationData): string {
  const { taskTitle, performedBy, status, dueDate, commentPreview } = data;

  switch (action) {
    case 'task_assigned':
      return `New task assigned: "${taskTitle}"${
        dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString()})` : ''
      }`;
    
    case 'task_status_changed':
      return `Task "${taskTitle}" status changed to ${status} by ${performedBy}`;
    
    case 'task_file_added':
      return `${performedBy} added a file to task "${taskTitle}"`;
    
    case 'task_comment_added':
      return `${performedBy} commented on "${taskTitle}": ${
        commentPreview?.length > 50 
          ? `${commentPreview.slice(0, 50)}...` 
          : commentPreview
      }`;
    
    case 'task_deleted':
      return `Task "${taskTitle}" was deleted by ${performedBy}`;
    
    default:
      return '';
  }
}