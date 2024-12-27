import { useState } from 'react';
import type { Resource } from '../types/resource';

const initialFormState = {
  name: '',
  url: '',
  username: '',
  password: '',
  accessUsers: [] as string[],
  notes: '',
};

export function useResourceForm() {
  const [formData, setFormData] = useState(initialFormState);

  const updateField = (field: keyof typeof initialFormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'accessUsers' 
        ? value.split(',').map(u => u.trim()).filter(Boolean)
        : value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  return {
    formData,
    updateField,
    resetForm,
  };
}