import React, { useState } from 'react';
import { PersonalChat } from './chat/PersonalChat';
import { MyTasks } from './tasks/MyTasks';
import { cn } from '../../lib/utils';

export function PersonalLayout() {
  const [showTasks, setShowTasks] = useState(true);

  return (
    <div className="flex h-full">
      {/* Chat Section */}
      <PersonalChat />

      {/* Tasks Panel */}
      <div className={cn(
        "border-l border-gray-700 bg-[#2D2D2D] transition-all duration-300 ease-in-out overflow-hidden",
        showTasks ? "w-80" : "w-0"
      )}>
        {showTasks && <MyTasks />}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowTasks(!showTasks)}
        className="absolute right-4 top-4 px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        {showTasks ? 'Hide Tasks' : 'Show Tasks'}
      </button>
    </div>
  );
}