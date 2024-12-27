import React from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LogoutButtonProps {
  onClick: () => void;
  className?: string;
}

export function LogoutButton({ onClick, className }: LogoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors",
        className
      )}
      title="Sign out"
    >
      <LogOut size={20} />
    </button>
  );
}