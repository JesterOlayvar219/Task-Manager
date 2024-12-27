import React from 'react';
import { NotificationsButton } from '../notifications/NotificationsButton';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarChannels } from './sidebar/SidebarChannels';
import { PrivateChatsSection } from '../channels/private/PrivateChatsSection';
import { SidebarProfile } from './sidebar/SidebarProfile';
import { cn } from '../../lib/utils';
import type { UserProfile } from '../../types/user';

interface SidebarContentProps {
  profile: UserProfile;
  activeChannel: string | null;
  isCollapsed: boolean;
  onChannelSelect: (channel: string) => void;
  onActivitySelect: () => void;
  onPersonalSelect: () => void;
  onNewTask: () => void;
}

export function SidebarContent({
  profile,
  activeChannel,
  isCollapsed,
  onChannelSelect,
  onActivitySelect,
  onPersonalSelect,
  onNewTask,
}: SidebarContentProps) {
  return (
    <>
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h1 className={cn(
          "text-lg font-semibold transition-opacity duration-200",
          isCollapsed && "opacity-0 w-0"
        )}>
          Task Manager
        </h1>
        <NotificationsButton />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        <SidebarNavigation
          activeChannel={activeChannel}
          isCollapsed={isCollapsed}
          onActivitySelect={onActivitySelect}
          onPersonalSelect={onPersonalSelect}
          onNewTask={onNewTask}
        />
        
        <SidebarChannels
          activeChannel={activeChannel}
          isCollapsed={isCollapsed}
          onChannelSelect={onChannelSelect}
        />
        
        <div className={cn(isCollapsed && 'px-2')}>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-xs font-medium text-gray-400 uppercase">
              Private Chats
            </div>
          )}
          <PrivateChatsSection
            activeChatId={activeChannel}
            onChatSelect={onChannelSelect}
          />
        </div>
      </nav>

      <SidebarProfile
        profile={profile}
        isCollapsed={isCollapsed}
      />
    </>
  );
}