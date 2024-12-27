import React from 'react';
import { cn } from '../../../../lib/utils';
import type { UserProfile } from '../../../../types/user';

interface UserSearchResultsProps {
  users: UserProfile[];
  selectedValue: string;
  loading: boolean;
  onSelect: (username: string) => void;
}

export function UserSearchResults({ 
  users, 
  selectedValue, 
  loading,
  onSelect 
}: UserSearchResultsProps) {
  if (loading) {
    return <div className="p-2 text-gray-400 text-center">Loading users...</div>;
  }

  if (!users?.length) {
    return <div className="p-2 text-gray-400 text-center">No users found</div>;
  }

  return (
    <div className="py-1">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user.username)}
          className={cn(
            "w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-700/50 transition-colors text-left",
            selectedValue === user.username && "bg-gray-700/50"
          )}
        >
          <div className="flex-1">
            <div className="text-sm text-white">{user.username}</div>
            <div className="text-xs text-gray-400">{user.role}</div>
          </div>
        </button>
      ))}
    </div>
  );
}