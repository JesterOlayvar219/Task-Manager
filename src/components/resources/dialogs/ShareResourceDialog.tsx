import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { DialogHeader } from './DialogHeader';
import { DialogSuccess } from './DialogSuccess';
import type { Resource } from '../../../types/resource';

interface ShareResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (resourceId: string, users: string[]) => Promise<void>;
  resource: Resource;
}

export function ShareResourceDialog({
  isOpen,
  onClose,
  onShare,
  resource,
}: ShareResourceDialogProps) {
  const [users, setUsers] = useState<string[]>(resource.accessUsers);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onShare(resource.id, users);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-md mx-4">
        <DialogHeader 
          title={`Share "${resource.name}"`}
          onClose={onClose}
        />
        
        {showSuccess ? (
          <DialogSuccess message="Resource shared successfully!" />
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Share with Users
              </label>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Users size={16} />
                <span className="text-sm">Enter usernames (comma-separated)</span>
              </div>
              <input
                type="text"
                value={users.join(', ')}
                onChange={(e) => setUsers(e.target.value.split(',').map(u => u.trim()).filter(Boolean))}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                placeholder="e.g., john.doe, jane.smith"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors"
              >
                Share Resource
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}