import React, { useState } from 'react';
import { SidebarToggle } from './SidebarToggle';
import { SidebarContent } from './SidebarContent';
import { cn } from '../../lib/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

interface SidebarProps {
  activeChannel: string | null;
  onChannelSelect: (channel: string) => void;
  onActivitySelect: () => void;
  onPersonalSelect: () => void;
  onNewTask: () => void;
}

export function Sidebar({
  activeChannel,
  onChannelSelect,
  onActivitySelect,
  onPersonalSelect,
  onNewTask,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthContext();
  const { profile, loading } = useProfile(user?.id);

  // Show loading state while profile is loading
  if (loading) {
    return (
      <aside className="w-64 h-screen bg-[#1E1F22] animate-pulse" />
    );
  }

  // Don't render if no profile
  if (!profile) return null;

  return (
    <aside
      className={cn(
        "relative h-screen bg-[#1E1F22] text-gray-300 flex flex-col",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      <SidebarToggle
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      
      <SidebarContent
        profile={profile}
        activeChannel={activeChannel}
        isCollapsed={isCollapsed}
        onChannelSelect={onChannelSelect}
        onActivitySelect={onActivitySelect}
        onPersonalSelect={onPersonalSelect}
        onNewTask={onNewTask}
      />
    </aside>
  );
}