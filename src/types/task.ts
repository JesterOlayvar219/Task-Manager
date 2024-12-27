export type TaskStatus = 'not-started' | 'in-progress' | 'completed';

export interface TaskFile {
  name: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  channelId?: string | null;
  personalChatId?: string | null;
  createdAt: string;
  files: TaskFile[];
  creator_username?: string;
  assignee_username?: string;
}