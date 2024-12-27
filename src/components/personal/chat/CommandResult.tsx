import React from 'react';
import { TaskCard } from '../../tasks/TaskCard';
import type { CommandResult } from '../../../types/command';

interface CommandResultProps {
  result: CommandResult;
}

export function CommandResult({ result }: CommandResultProps) {
  if (result.type === 'error' || !result.data.length) {
    return (
      <div className="text-gray-400 italic overflow-y-auto max-h-[300px]">
        {result.message || 'No results found'}
      </div>
    );
  }

  if (result.type === 'users') {
    return (
      <div className="space-y-4 overflow-y-auto max-h-[300px]">
        {result.message && (
          <div className="text-gray-400 mb-4">{result.message}</div>
        )}
        <div className="space-y-2">
          {result.data.map((username) => (
            <div 
              key={username}
              className="px-3 py-2 bg-gray-800/30 rounded-lg text-gray-200"
            >
              @{username}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[300px]">
      {result.message && (
        <div className="text-gray-400 mb-4">{result.message}</div>
      )}
      <div className="space-y-4">
        {result.data.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => {}}
            onDelete={() => {}}
            onStatusChange={() => {}}
          />
        ))}
      </div>
    </div>
  );
}