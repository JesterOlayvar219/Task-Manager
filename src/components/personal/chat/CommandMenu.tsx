import React from 'react';
import type { Command } from '../../../types/command';

interface CommandMenuProps {
  commands: Command[];
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandMenu({ commands, onSelect, onClose }: CommandMenuProps) {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-700">
      <div className="p-2">
        <div className="text-sm text-gray-400 px-2 py-1">Available Commands</div>
        {commands.map((command) => (
          <button
            key={command.name}
            onClick={() => {
              onSelect(`/${command.name}`);
              onClose();
            }}
            className="w-full px-2 py-2 text-left hover:bg-gray-700/50 rounded"
          >
            <div className="text-white">/{command.name}</div>
            <div className="text-sm text-gray-400">{command.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}