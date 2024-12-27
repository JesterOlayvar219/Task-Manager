import { useAuthContext } from '../../contexts/AuthContext';
import { createTask } from '../../lib/supabase/queries/tasks/create';
import { updateTaskStatus, deleteTask } from '../../lib/supabase/queries/tasks/mutations';
import type { Task, TaskStatus } from '../../types/task';

interface UseTaskOperationsProps {
  channelId?: string;
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
}

export function useTaskOperations({ channelId, setTasks }: UseTaskOperationsProps) {
  const { user } = useAuthContext();

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const newTask = await createTask({
        title: taskData.title,
        description: taskData.description,
        assignee: taskData.assignee,
        dueDate: taskData.dueDate,
        status: taskData.status,
        channelId,
        files: taskData.files
      }, user.id);

      setTasks(prev => [...prev, newTask as Task]);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    addTask,
    updateTaskStatus: handleUpdateStatus,
    deleteTask: handleDelete
  };
}