// Task status constants and validation
export const TASK_STATUSES = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];

export function isValidTaskStatus(status: unknown): status is TaskStatus {
  if (typeof status !== 'string') return false;
  return Object.values(TASK_STATUSES).includes(status as TaskStatus);
}

export function validateTaskStatus(status: unknown): TaskStatus {
  if (!isValidTaskStatus(status)) {
    throw new Error(`Invalid task status: ${status}. Must be one of: ${Object.values(TASK_STATUSES).join(', ')}`);
  }
  return status;
}

export function getStatusInfo(status: TaskStatus) {
  const statusMap = {
    'not-started': {
      label: 'Not Started',
      bgColor: 'bg-gray-700/30',
      textColor: 'text-gray-300',
      borderColor: 'border-gray-600/50',
      hoverBg: 'hover:bg-gray-700/50'
    },
    'in-progress': {
      label: 'In Progress',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      hoverBg: 'hover:bg-yellow-500/20'
    },
    'completed': {
      label: 'Completed',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      hoverBg: 'hover:bg-emerald-500/20'
    }
  };

  return statusMap[status];
}