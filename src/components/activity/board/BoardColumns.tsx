import React from 'react';
import { DraggableColumn } from './DraggableColumn';
import { DraggableTaskCard } from './DraggableTaskCard';
import type { Task, TaskStatus } from '../../../types/task';

interface BoardColumnsProps {
  columns: Array<{ status: TaskStatus; title: string; tasks: Task[] }>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function BoardColumns({ 
  columns = [], 
  onEditTask, 
  onDeleteTask, 
  onStatusChange 
}: BoardColumnsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {columns.map(({ status, title, tasks = [] }) => (
        <DraggableColumn
          key={status}
          status={status}
          title={title}
          count={tasks?.length || 0}
        >
          <div className="space-y-3 overflow-y-auto max-h-full">
            {tasks?.map(task => (
              <DraggableTaskCard
                key={`${status}-${task.id}`}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </DraggableColumn>
      ))}
    </div>
  );
}