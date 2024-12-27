import React from 'react';
import { cn } from '../../lib/utils';
import { getStatusInfo } from '../../lib/utils/task';
import type { Task } from '../../types/task';

interface TaskStatusBadgeProps {
  status: Task['status'];
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  // Get status info with fallback for invalid status
  const statusInfo = getStatusInfo(status) || {
    label: 'Unknown',
    bgColor: 'bg-gray-700/30',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-600/50'
  };
  
  return (
    <span className={cn(
      'px-2.5 py-1 text-xs font-medium rounded-full border',
      'transition-colors duration-200',
      statusInfo.bgColor,
      statusInfo.textColor,
      statusInfo.borderColor,
      className
    )}>
      {statusInfo.label}
    </span>
  );
}