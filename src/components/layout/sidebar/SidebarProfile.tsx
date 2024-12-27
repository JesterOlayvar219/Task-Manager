import React from 'react';
import { LogoutButton } from './LogoutButton';
import { supabase } from '../../../lib/supabase/client';
import { cn } from '../../../lib/utils';
import type { UserProfile } from '../../../types/user';

interface SidebarProfileProps {
  profile: UserProfile;
  isCollapsed: boolean;
}

export function SidebarProfile({ profile, isCollapsed }: SidebarProfileProps) {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-medium">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
        {!isCollapsed && (
          <div className="text-left">
            <div className="text-sm font-medium text-gray-100">{profile.username}</div>
            <div className="text-xs text-gray-400">{profile.role}</div>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <LogoutButton onClick={handleSignOut} />
      )}
    </div>
  );
}