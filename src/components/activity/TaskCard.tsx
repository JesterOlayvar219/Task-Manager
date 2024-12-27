import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils/date';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const statusStyles = {
    'not-started': 'border-gray-600/50 hover:border-gray-500/50',
    'in-progress': 'border-yellow-500/30 hover:border-yellow-500/50',
    'completed': 'border-emerald-500/30 hover:border-emerald-500/50'
  };

  return (
    <div className={cn(
      'p-4 bg-[#1E1F22] rounded-lg border transition-all',
      'hover:bg-[#2B2D31] hover:shadow-lg',
      statusStyles[task.status]
    )}>
      <h4 className="font-medium text-gray-200 mb-2 line-clamp-1">{task.title}</h4>
      
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
        {task.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="shrink-0" />
          <span>Created: {formatDate(task.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} className="shrink-0" />
          <span>Due: {formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
}