import { useState } from 'react';
import { useResourceForm } from './useResourceForm';
import type { Resource } from '../types/resource';

interface UseAddResourceDialogProps {
  onSubmit: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function useAddResourceDialog({ onSubmit, onClose }: UseAddResourceDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { formData, updateField, resetForm } = useResourceForm();

  const handleSubmit = (data: typeof formData) => {
    onSubmit({
      ...data,
      accessUsers: data.accessUsers.length ? data.accessUsers : ['Everyone'],
    });
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      resetForm();
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return {
    formData,
    updateField,
    showSuccess,
    handleSubmit,
    handleClose,
  };
}