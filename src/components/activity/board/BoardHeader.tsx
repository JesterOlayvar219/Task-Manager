import React from 'react';
import { NewTaskButton } from '../../tasks/NewTaskButton';

interface BoardHeaderProps {
  taskCount: number;
  onNewTask: () => void;
}

export function BoardHeader({ taskCount, onNewTask }: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-100">Activity Board</h2>
        <span className="text-sm text-gray-400">{taskCount} tasks</span>
      </div>
      <NewTaskButton onClick={onNewTask} />
    </div>
  );
}