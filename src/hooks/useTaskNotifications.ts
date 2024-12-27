import { useCallback } from 'react';
import { sendNotification } from '../lib/supabase/notifications/send';
import type { Task } from '../types/task';

export function useTaskNotifications() {
  const notifyTaskStatusChanged = useCallback(async (
    task: Task,
    newStatus: Task['status'],
    performedBy: string
  ) => {
    try {
      // Only notify if the person changing status is not the creator
      if (task.created_by !== performedBy) {
        await sendNotification(task.created_by, 'task_status_changed', {
          taskId: task.id,
          taskTitle: task.title,
          status: newStatus,
          performedBy,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending task status notification:', error);
    }
  }, []);

  const notifyTaskCreated = useCallback(async (
    task: Task,
    performedBy: string
  ) => {
    try {
      // Only notify if assignee is different from creator
      if (task.assignee !== task.created_by) {
        await sendNotification(task.assignee, 'task_assigned', {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.due_date,
          performedBy,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending task creation notification:', error);
    }
  }, []);

  const notifyTaskCommentAdded = useCallback(async (
    task: Task,
    commentContent: string,
    performedBy: string,
    recipient: string
  ) => {
    try {
      // Don't send notification if commenter is the recipient
      if (performedBy !== recipient) {
        await sendNotification(recipient, 'task_comment_added', {
          taskId: task.id,
          taskTitle: task.title,
          commentPreview: commentContent,
          performedBy,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending comment notification:', error);
    }
  }, []);

  return {
    notifyTaskStatusChanged,
    notifyTaskCreated,
    notifyTaskCommentAdded
  };
}