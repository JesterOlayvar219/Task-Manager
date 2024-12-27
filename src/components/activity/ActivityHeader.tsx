import React from 'react';
import { NewTaskButton } from '../tasks/NewTaskButton';
import { useTaskDialog } from '../../hooks/useTaskDialog';
import { TaskDialog } from '../tasks/TaskDialog';
import { useTasks } from '../../hooks/useTasks';
import { CHANNELS } from '../../lib/constants';
import type { Task } from '../../types/task';

export function ActivityHeader() {
  const { isOpen, openDialog, closeDialog } = useTaskDialog();
  const { addTask } = useTasks();

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    try {
      await addTask(taskData);
      closeDialog();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Activity Board</h2>
          <p className="text-sm text-gray-400">Track and manage all tasks</p>
        </div>
        <NewTaskButton onClick={openDialog} />
      </div>

      <TaskDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onSubmit={handleTaskSubmit}
        channels={CHANNELS}
      />
    </>
  );
}