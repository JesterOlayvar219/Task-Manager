import React, { useState, useMemo } from 'react';
import { TaskList } from './tasks/TaskList';
import { TasksHeader } from './tasks/TasksHeader';
import { usePersonalTasks } from '../../hooks/usePersonalTasks';

export function PersonalTasks() {
  const [showCompleted, setShowCompleted] = useState(false);
  const { tasks, loading, error, updateTaskStatus } = usePersonalTasks();

  const filteredTasks = useMemo(() => {
    const filtered = showCompleted
      ? tasks.filter(task => task.status === 'completed')
      : tasks.filter(task => task.status !== 'completed');

    return [...filtered].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [tasks, showCompleted]);

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
    <div className="h-full flex flex-col">
      <TasksHeader
        taskCount={tasks.length}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        <TaskList
          tasks={filteredTasks}
          onStatusChange={updateTaskStatus}
        />
      </div>
    </div>
  );
}