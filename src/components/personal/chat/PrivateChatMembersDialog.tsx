import React from 'react';
import { X, User } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PrivateChatMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
}

export function PrivateChatMembersDialog({ 
  isOpen, 
  onClose, 
  members 
}: PrivateChatMembersDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Chat Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member}
                className={cn(
                  "flex items-center gap-3 p-3",
                  "bg-gray-800/30 rounded-lg"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
                <span className="text-gray-200">{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}