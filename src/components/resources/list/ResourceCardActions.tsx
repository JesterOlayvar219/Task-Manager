import React from 'react';
import { Share2, Pencil, Trash2 } from 'lucide-react';

interface ResourceCardActionsProps {
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResourceCardActions({ onShare, onEdit, onDelete }: ResourceCardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onShare}
        className="p-1.5 text-gray-400 hover:text-[#10A37F] hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Share resource"
      >
        <Share2 size={16} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Edit resource"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Delete resource"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}