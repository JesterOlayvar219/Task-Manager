export type NotificationType = 'task' | 'comment' | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  recipient: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
  commentId?: string;
}