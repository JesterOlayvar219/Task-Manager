import React, { useState } from 'react';
import { TaskDialogHeader } from './dialog/TaskDialogHeader';
import { TaskDialogSuccess } from './dialog/TaskDialogSuccess';
import { TaskForm } from './form/TaskForm';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Task } from '../../types/task';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  channels: { id: string; name: string }[];
  initialData?: Task;
}

export function TaskDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  channels,
  initialData 
}: TaskDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuthContext();

  if (!isOpen || !user) return null;

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    try {
      await onSubmit({
        ...taskData,
        created_by: user.id,
        status: taskData.status || 'not-started'
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting task:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <TaskDialogHeader 
          isEditing={!!initialData} 
          onClose={onClose} 
        />
        
        {showSuccess ? (
          <TaskDialogSuccess isEditing={!!initialData} />
        ) : (
          <div className="overflow-y-auto">
            <TaskForm
              onSubmit={handleSubmit}
              channels={channels}
              initialData={initialData}
            />
          </div>
        )}
      </div>
    </div>
  );
}