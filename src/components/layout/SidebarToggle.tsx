import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({ isCollapsed, onToggle, className }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "absolute -right-3 top-6 p-1.5 rounded-full bg-[#1E1F22] border border-gray-700",
        "text-gray-400 hover:text-white transition-colors z-50",
        className
      )}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <ChevronRight size={14} />
      ) : (
        <ChevronLeft size={14} />
      )}
    </button>
  );
}