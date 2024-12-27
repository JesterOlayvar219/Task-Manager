import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded text-sm",
        isConnected ? "text-emerald-400" : "text-red-400",
        className
      )}
    >
      {isConnected ? (
        <>
          <Wifi size={14} />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Reconnecting...</span>
        </>
      )}
    </div>
  );
}