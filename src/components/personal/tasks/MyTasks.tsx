import React, { useState } from 'react';
import { TaskList } from './TaskList';
import { TasksHeader } from './TasksHeader';
import { usePersonalTasks } from '../../../hooks/usePersonalTasks';
import { cn } from '../../../lib/utils';

interface MyTasksProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function MyTasks({ isExpanded = false, onToggleExpand }: MyTasksProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const { tasks, loading, error, updating, updateTaskStatus, deleteTask } = usePersonalTasks();

  const filteredTasks = tasks.filter(task => 
    showCompleted ? task.status === 'completed' : task.status !== 'completed'
  );

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className={cn(
      "h-full flex flex-col",
      isExpanded && "w-full"
    )}>
      <TasksHeader
        taskCount={tasks.length}
        showCompleted={showCompleted}
        isExpanded={isExpanded}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
        onToggleExpand={onToggleExpand}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            No tasks assigned to you
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onStatusChange={updateTaskStatus}
            onDelete={handleDeleteTask}
            disabled={updating}
          />
        )}
      </div>
    </div>
  );
}