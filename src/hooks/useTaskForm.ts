import { useState } from 'react';
import { validateTaskAssignment } from '../lib/utils/validation';
import type { Task } from '../types/task';

interface UseTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Task;
}

export function useTaskForm({ onSubmit, initialData }: UseTaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignee: initialData?.assignee || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    channelId: initialData?.channelId || '',
    status: initialData?.status || 'not-started' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getFormattedData = () => ({
    title: formData.title,
    description: formData.description,
    assignee: formData.assignee,
    dueDate: formData.dueDate,
    channelId: formData.channelId || null, // Convert empty string to null
    status: formData.status,
    files: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTaskAssignment(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(getFormattedData());
  };

  return {
    formData,
    errors,
    updateField,
    handleSubmit,
    getFormattedData
  };
}