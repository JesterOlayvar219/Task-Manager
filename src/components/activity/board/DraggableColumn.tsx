import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/utils';
import type { TaskStatus } from '../../../types/task';

interface DraggableColumnProps {
  status: TaskStatus;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function DraggableColumn({ status, title, count, children }: DraggableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full bg-[#202124] rounded-lg p-4',
        isOver && 'ring-2 ring-[#10A37F] ring-opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-200 uppercase text-sm">{title}</h3>
          <span className="text-xs text-gray-400">{count}</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}