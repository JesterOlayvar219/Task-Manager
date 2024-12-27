import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NewTaskButton } from './NewTaskButton';
import { TaskDialog } from './TaskDialog';
import { TaskCard } from './TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { useAuthContext } from '../../contexts/AuthContext';
import { CHANNELS } from '../../lib/constants';
import type { Task } from '../../types/task';

interface ChannelTasksProps {
  channelId: string;
}

export function ChannelTasks({ channelId }: ChannelTasksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuthContext();
  const { tasks, loading, error, addTask, updateTaskStatus, deleteTask } = useTasks(channelId);

  const channel = CHANNELS.find(c => c.id === channelId);
  const channelName = channel?.name || 'Channel Tasks';

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      await addTask({
        ...taskData,
        channelId,
        createdBy: user.id
      });
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#313338] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#313338] p-6">
        <div className="flex items-center justify-center h-64 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#313338] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-100">{channelName}</h2>
          <span className="text-sm text-gray-400">{tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-300 hover:text-white">
            <span>Sort by</span>
            <ChevronDown size={16} />
          </button>
          <NewTaskButton onClick={() => setIsDialogOpen(true)} />
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-400">
          <p>No tasks in this channel yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
            />
          ))}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        channels={CHANNELS}
        initialData={editingTask}
      />
    </div>
  );
}