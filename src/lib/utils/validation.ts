export function validateTaskAssignment(taskData: {
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
}) {
  const errors: Record<string, string> = {};

  if (!taskData.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!taskData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!taskData.assignee?.trim()) {
    errors.assignee = 'Assignee is required';
  }

  if (!taskData.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const date = new Date(taskData.dueDate);
    if (isNaN(date.getTime())) {
      errors.dueDate = 'Invalid date format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}