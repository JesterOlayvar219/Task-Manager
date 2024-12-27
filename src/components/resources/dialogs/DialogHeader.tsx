import React from 'react';
import { X } from 'lucide-react';

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
}

export function DialogHeader({ title, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-700">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}