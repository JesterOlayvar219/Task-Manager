import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ActivityHeader } from './ActivityHeader';
import { TaskStatusColumn } from './TaskStatusColumn';
import { useTasks } from '../../hooks/useTasks';

export function ActivityBoard() {
  const { 
    tasks, 
    loading, 
    error,
    notStartedTasks,
    inProgressTasks,
    completedTasks
  } = useTasks();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="h-full flex flex-col bg-[#313338]">
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <ActivityHeader />
      </div>
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-3 gap-6 h-full">
          <TaskStatusColumn
            title="Not Started"
            tasks={notStartedTasks}
            status="not-started"
          />
          <TaskStatusColumn
            title="In Progress"
            tasks={inProgressTasks}
            status="in-progress"
          />
          <TaskStatusColumn
            title="Completed"
            tasks={completedTasks}
            status="completed"
          />
        </div>
      </div>
    </div>
  );
}