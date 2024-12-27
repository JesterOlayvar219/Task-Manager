import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCard } from '../tasks/TaskCard';
import type { Task } from '../../types/task';
import { cn } from '../../lib/utils';

interface DraggableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function DraggableTaskCard({ task, ...props }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <TaskCard task={task} {...props} />
    </div>
  );
}