import React from 'react';
import { Plus } from 'lucide-react';

interface AddResourceButtonProps {
  onClick: () => void;
}

export function AddResourceButton({ onClick }: AddResourceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors"
    >
      <Plus size={16} />
      <span className="text-sm font-medium">Add Resource</span>
    </button>
  );
}