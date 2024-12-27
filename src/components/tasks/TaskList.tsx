import React from 'react';
import { TaskCard } from './TaskCard';
import { useFirebaseTasks } from '../../hooks/useFirebaseTasks';
import type { Task } from '../../types/task';

interface TaskListProps {
  channelId?: string;
  onEdit: (task: Task) => void;
  className?: string;
}

export function TaskList({ channelId, onEdit, className }: TaskListProps) {
  const { tasks, loading, error, updateTaskStatus } = useFirebaseTasks(channelId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No tasks found.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={() => {}} // Implement delete functionality
            onStatusChange={(status) => updateTaskStatus(task.id, status)}
          />
        ))}
      </div>
    </div>
  );
}