import React from 'react';
import type { Command } from '../../types/view';

interface CommandMenuProps {
  onSelect: (command: string) => void;
  onClose: () => void;
}

const commands = [
  {
    id: 'show-tasks',
    label: 'show tasks',
    description: 'Display a summary of your tasks',
  },
  {
    id: 'clear-chat',
    label: 'clear chat',
    description: 'Clear all chat messages',
  },
  {
    id: 'filter-completed',
    label: 'filter completed tasks',
    description: 'Show only completed tasks',
  },
];

export function CommandMenu({ onSelect, onClose }: CommandMenuProps) {
  return (
    <div className="absolute bottom-24 left-4 w-80 bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-700">
      <div className="p-2">
        <div className="text-sm text-gray-400 px-2 py-1">Commands</div>
        {commands.map((command) => (
          <button
            key={command.id}
            onClick={() => {
              onSelect(command.label);
              onClose();
            }}
            className="w-full px-2 py-2 text-left hover:bg-gray-700/50 rounded"
          >
            <div className="text-white">/{command.label}</div>
            <div className="text-sm text-gray-400">{command.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}