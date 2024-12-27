import React from 'react';
import { LayoutGrid, MessageSquare, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SidebarNavigationProps {
  activeChannel: string | null;
  isCollapsed: boolean;
  onActivitySelect: () => void;
  onPersonalSelect: () => void;
  onNewTask: () => void;
}

export function SidebarNavigation({ 
  activeChannel, 
  isCollapsed, 
  onActivitySelect, 
  onPersonalSelect,
  onNewTask
}: SidebarNavigationProps) {
  return (
    <>
      <button
        onClick={onNewTask}
        className={cn(
          "w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-colors",
          "bg-[#10A37F] hover:bg-[#15b892] text-white",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? "New Task" : undefined}
      >
        <Plus size={18} />
        {!isCollapsed && (
          <span>New Task</span>
        )}
      </button>

      <button
        onClick={onActivitySelect}
        className={cn(
          "w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-700/50",
          activeChannel === null && "bg-gray-700 text-white",
          isCollapsed && "justify-center"
        )}
      >
        <LayoutGrid size={18} />
        {!isCollapsed && (
          <span>Activity Board</span>
        )}
      </button>

      <button
        onClick={onPersonalSelect}
        className={cn(
          "w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-700/50",
          isCollapsed && "justify-center"
        )}
      >
        <MessageSquare size={18} />
        {!isCollapsed && (
          <span>Personal Chat</span>
        )}
      </button>
    </>
  );
}