import React from 'react';
import { Users } from 'lucide-react';

interface ResourceCardFooterProps {
  accessUsers: string[];
}

export function ResourceCardFooter({ accessUsers }: ResourceCardFooterProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-400">
      <Users size={14} />
      <span>Shared with: {accessUsers.join(', ')}</span>
    </div>
  );
}