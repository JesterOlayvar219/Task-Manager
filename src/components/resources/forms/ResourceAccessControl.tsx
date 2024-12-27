import React from 'react';
import { Users } from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';
import { cn } from '../../../lib/utils';

interface ResourceAccessControlProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  isPublic: boolean;
  onPublicChange: (isPublic: boolean) => void;
}

export function ResourceAccessControl({
  selectedUsers,
  onChange,
  isPublic,
  onPublicChange
}: ResourceAccessControlProps) {
  const { users, loading } = useUsers();

  const handleUserToggle = (username: string) => {
    const newUsers = selectedUsers.includes(username)
      ? selectedUsers.filter(u => u !== username)
      : [...selectedUsers, username];
    onChange(newUsers);
  };

  const handleSelectAll = () => {
    onChange(users.map(u => u.username));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Header with Select/Clear All */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-200">
          Access Control
        </label>
        {!isPublic && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-[#10A37F] hover:text-[#15b892]"
            >
              Select All
            </button>
            <span className="text-gray-500">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-[#10A37F] hover:text-[#15b892]"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Public Access Toggle */}
      <div className="flex items-center gap-2 p-2 bg-[#1E1E1E] rounded-lg border border-[#2F2F2F]">
        <input
          type="checkbox"
          id="public-access"
          checked={isPublic}
          onChange={(e) => onPublicChange(e.target.checked)}
          className="rounded border-gray-600 text-[#10A37F] focus:ring-[#10A37F]"
        />
        <label htmlFor="public-access" className="text-sm text-gray-300">
          Make this resource public (visible to everyone)
        </label>
      </div>

      {/* User Selection */}
      {!isPublic && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span className="text-sm">Select specific users who can access this resource</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg p-2">
            {loading ? (
              <div className="text-sm text-gray-400 p-2">Loading users...</div>
            ) : (
              users.map(user => (
                <label
                  key={user.username}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer",
                    "hover:bg-gray-700/30 transition-colors"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.username)}
                    onChange={() => handleUserToggle(user.username)}
                    className="rounded border-gray-600 text-[#10A37F] focus:ring-[#10A37F]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate">{user.username}</div>
                    <div className="text-xs text-gray-400">{user.role}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}