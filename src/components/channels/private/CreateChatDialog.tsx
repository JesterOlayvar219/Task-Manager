import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog';
import { useUsers } from '../../../hooks/useUsers';
import { cn } from '../../../lib/utils';

interface CreateChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, members: string[]) => Promise<void>;
}

export function CreateChatDialog({ isOpen, onClose, onSubmit }: CreateChatDialogProps) {
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { users, loading } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError('');
      await onSubmit(name.trim(), selectedUsers);
      onClose();
      setName('');
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUser = (username: string) => {
    setSelectedUsers(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Private Chat"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Chat Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter chat name"
            className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Select Members <span className="text-red-400">*</span>
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg p-2">
            {loading ? (
              <div className="text-sm text-gray-400 p-2">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-400 p-2">No users found</div>
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
                    onChange={() => toggleUser(user.username)}
                    className="rounded border-gray-600 text-[#10A37F] focus:ring-[#10A37F]"
                  />
                  <span className="text-sm text-gray-200">{user.username}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || selectedUsers.length === 0 || submitting}
            className={cn(
              "px-4 py-2 text-sm bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {submitting ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}