import React from 'react';
import { X } from 'lucide-react';

interface TaskDialogHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export function TaskDialogHeader({ isEditing, onClose }: TaskDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-700">
      <h2 className="text-xl font-semibold text-white">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}