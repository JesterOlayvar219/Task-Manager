import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  taskTitle: string;
}

export function DeleteTaskDialog({ isOpen, onClose, onConfirm, taskTitle }: DeleteTaskDialogProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Delete Task</h2>
          </div>
          
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete "<span className="text-white">{taskTitle}</span>"? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}