import React from 'react';
import { cn } from '../../../lib/utils';

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <div 
      className={cn(
        "min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-[#10A37F] text-white text-xs font-medium",
        "flex items-center justify-center",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
}