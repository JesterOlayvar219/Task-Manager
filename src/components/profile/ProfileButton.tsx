import React from 'react';
import { User } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface ProfileButtonProps {
  profile: UserProfile;
  onClick: () => void;
}

export function ProfileButton({ profile, onClick }: ProfileButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 border-t border-gray-700 w-full hover:bg-gray-700/30 transition-colors"
    >
      {profile.profileImage ? (
        <img
          src={profile.profileImage}
          alt={profile.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      )}
      <div className="text-left">
        <div className="text-sm font-medium">{profile.username}</div>
        <div className="text-xs text-gray-400">
          {profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>
    </button>
  );
}