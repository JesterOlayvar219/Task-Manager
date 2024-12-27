import React from 'react';
import { User, Calendar, Clock } from 'lucide-react';
import { getFormattedTaskDates, getTaskUserInfo } from '../../lib/utils/task-display';
import type { Task } from '../../types/task';

interface TaskMetaInfoProps {
  task: Task;
}

export function TaskMetaInfo({ task }: TaskMetaInfoProps) {
  const { dueDate, createdDate } = getFormattedTaskDates(task);
  const { creator, assignee } = getTaskUserInfo(task);

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-300">
          <User size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">
            Created by: {creator}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <User size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">
            Assigned to: {assignee}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-300 justify-end">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          <span>Due: {dueDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300 justify-end">
          <Clock size={14} className="shrink-0 text-gray-400" />
          <span>Created: {createdDate}</span>
        </div>
      </div>
    </div>
  );
}