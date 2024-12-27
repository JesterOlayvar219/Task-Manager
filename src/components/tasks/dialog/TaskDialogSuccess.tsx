import React from 'react';

interface TaskDialogSuccessProps {
  isEditing: boolean;
}

export function TaskDialogSuccess({ isEditing }: TaskDialogSuccessProps) {
  return (
    <div className="p-6 flex items-center justify-center">
      <div className="text-emerald-400 text-lg font-medium">
        Task {isEditing ? 'Updated' : 'Created'} Successfully!
      </div>
    </div>
  );
}