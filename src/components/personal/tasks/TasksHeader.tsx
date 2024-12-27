import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TasksHeaderProps {
  taskCount: number;
  showCompleted: boolean;
  isExpanded: boolean;
  onToggleCompleted: () => void;
  onToggleExpand: () => void;
}

export function TasksHeader({ 
  taskCount, 
  showCompleted, 
  isExpanded,
  onToggleCompleted,
  onToggleExpand
}: TasksHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div>
        <h2 className="text-lg font-semibold text-gray-100">My Tasks</h2>
        <p className="text-sm text-gray-400">
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'} assigned to you
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleCompleted}
          className={cn(
            "px-3 py-1 text-sm rounded-lg transition-colors",
            "hover:bg-gray-700/50",
            showCompleted ? "text-gray-400" : "text-emerald-400"
          )}
        >
          {showCompleted ? 'Show Active' : 'Show Completed'}
        </button>
        <button
          onClick={onToggleExpand}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );
}