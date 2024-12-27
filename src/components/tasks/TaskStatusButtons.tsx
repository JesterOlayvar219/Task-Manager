import React from 'react';
import { cn } from '../../lib/utils';
import { TASK_STATUSES, getStatusInfo } from '../../lib/utils/task';
import type { Task } from '../../types/task';

interface TaskStatusButtonsProps {
  currentStatus: Task['status'];
  onStatusChange: (status: Task['status']) => void;
  disabled?: boolean;
}

const statusButtons = [
  { status: TASK_STATUSES.NOT_STARTED, label: 'Not Started' },
  { status: TASK_STATUSES.IN_PROGRESS, label: 'In Progress' },
  { status: TASK_STATUSES.COMPLETED, label: 'Completed' },
] as const;

export function TaskStatusButtons({ 
  currentStatus, 
  onStatusChange,
  disabled = false
}: TaskStatusButtonsProps) {
  const handleStatusChange = (newStatus: Task['status']) => {
    if (disabled || newStatus === currentStatus) return;
    onStatusChange(newStatus);
  };

  return (
    <div 
      className="flex flex-wrap gap-2" 
      role="group" 
      aria-label="Task status options"
    >
      {statusButtons.map(({ status, label }) => {
        const isActive = status === currentStatus;
        const isDisabled = disabled || isActive;
        const statusInfo = getStatusInfo(status);
        
        return (
          <button
            key={status}
            type="button"
            disabled={isDisabled}
            aria-pressed={isActive}
            aria-label={`Mark task as ${label}${isActive ? ' (current status)' : ''}`}
            onClick={() => handleStatusChange(status)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200',
              'border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10A37F]',
              isActive && [
                statusInfo.bgColor,
                statusInfo.textColor,
                statusInfo.borderColor,
              ],
              !isActive && [
                'bg-transparent border-gray-700/50 text-gray-400',
                'hover:text-white hover:border-gray-600',
                statusInfo.hoverBg
              ],
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}