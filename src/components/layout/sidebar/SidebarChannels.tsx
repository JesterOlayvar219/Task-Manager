import React from 'react';
import { cn } from '../../../lib/utils';
import { CHANNELS } from '../../../lib/constants';

interface SidebarChannelsProps {
  activeChannel: string | null;
  isCollapsed: boolean;
  onChannelSelect: (channel: string) => void;
}

export function SidebarChannels({ 
  activeChannel, 
  isCollapsed, 
  onChannelSelect 
}: SidebarChannelsProps) {
  return (
    <div className="pt-4">
      <div className={cn(
        "px-3 pb-2 text-xs font-medium text-gray-400 uppercase",
        isCollapsed && "text-center"
      )}>
        {!isCollapsed && "Channels"}
      </div>
      <div className="space-y-1">
        {CHANNELS.map(channel => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={cn(
                "w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-700/50",
                activeChannel === channel.id && "bg-gray-700 text-white",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? channel.name : undefined}
            >
              <Icon size={18} />
              {!isCollapsed && (
                <span>{channel.name}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}