import React from 'react';
import { TaskCard } from './TaskCard';
import { cn } from '../../lib/utils';
import type { Task, TaskStatus } from '../../types/task';

interface TaskStatusColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
}

export function TaskStatusColumn({ title, tasks, status }: TaskStatusColumnProps) {
  const columnStyles = {
    'not-started': 'border-gray-600/50',
    'in-progress': 'border-yellow-500/30',
    'completed': 'border-emerald-500/30'
  };

  return (
    <div className={cn(
      'flex flex-col min-h-0 bg-[#2B2D31] rounded-lg border',
      columnStyles[status]
    )}>
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-200">{title}</h3>
          <span className="text-sm text-gray-400">{tasks.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}