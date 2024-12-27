import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PrivateChatMembersDialog } from './PrivateChatMembersDialog';

interface PrivateChatMembersProps {
  members: string[];
}

export function PrivateChatMembers({ members }: PrivateChatMembersProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        title="View members"
      >
        <Users size={20} />
      </button>

      <PrivateChatMembersDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        members={members}
      />
    </>
  );
}