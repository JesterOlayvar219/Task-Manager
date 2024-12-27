export type NotificationAction = 
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_file_added'
  | 'task_comment_added'
  | 'task_deleted';

export interface NotificationData {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  status?: string;
  commentPreview?: string;
  commentId?: string;
  performedBy: string;
  timestamp: string;
}

export interface NotificationPayload {
  type: NotificationAction;
  message: string;
  recipient: string;
  task_id?: string;
  comment_id?: string;
  timestamp: string;
  read: boolean;
}