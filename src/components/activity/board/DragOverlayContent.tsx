import React from 'react';
import { TaskCard } from '../../tasks/TaskCard';
import type { Task } from '../../../types/task';

interface DragOverlayContentProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function DragOverlayContent({ task, ...props }: DragOverlayContentProps) {
  return (
    <div className="w-[320px]">
      <TaskCard task={task} {...props} />
    </div>
  );
}