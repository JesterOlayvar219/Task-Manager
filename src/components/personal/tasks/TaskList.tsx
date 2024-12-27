import React from 'react';
import { TaskCard } from '../../tasks/TaskCard';
import type { Task } from '../../../types/task';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDelete: (taskId: string) => Promise<void>;
  disabled?: boolean;
}

export function TaskList({ tasks, onStatusChange, onDelete, disabled }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-8">
        No tasks to display
      </div>
    );
  }

  const handleDelete = async (taskId: string) => {
    try {
      await onDelete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => {}}
          onDelete={handleDelete}
          onStatusChange={onStatusChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
}