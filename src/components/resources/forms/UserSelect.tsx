```tsx
import React from 'react';
import { Users } from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';

interface UserSelectProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  isPublic: boolean;
  onPublicChange: (isPublic: boolean) => void;
}

export function UserSelect({ selectedUsers, onChange, isPublic, onPublicChange }: UserSelectProps) {
  const { users, loading } = useUsers();

  const handleUserToggle = (username: string) => {
    const newUsers = selectedUsers.includes(username)
      ? selectedUsers.filter(u => u !== username)
      : [...selectedUsers, username];
    onChange(newUsers);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-200">
        Access Control
      </label>

      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          id="public-access"
          checked={isPublic}
          onChange={(e) => onPublicChange(e.target.checked)}
          className="rounded border-gray-600 text-[#10A37F] focus:ring-[#10A37F]"
        />
        <label htmlFor="public-access" className="text-sm text-gray-300">
          Make this resource public
        </label>
      </div>

      {!isPublic && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span className="text-sm">Select users who can access this resource</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg p-2">
            {loading ? (
              <div className="text-sm text-gray-400 p-2">Loading users...</div>
            ) : (
              users.map(user => (
                <label
                  key={user.username}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.username)}
                    onChange={() => handleUserToggle(user.username)}
                    className="rounded border-gray-600 text-[#10A37F] focus:ring-[#10A37F]"
                  />
                  <span className="text-sm text-gray-200">{user.username}</span>
                  <span className="text-xs text-gray-400">({user.role})</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```