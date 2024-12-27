import React, { useState } from 'react';
import { Link2, Users, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DeleteResourceDialog } from './dialogs/DeleteResourceDialog';

interface ResourceCardProps {
  name: string;
  url?: string;
  username?: string;
  notes?: string;
  accessUsers: string[];
  onDelete: () => Promise<void>;
}

export function ResourceCard({ 
  name, 
  url, 
  username, 
  notes, 
  accessUsers,
  onDelete 
}: ResourceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isPublic = accessUsers.includes('Everyone');

  return (
    <>
      <div className="bg-[#2D2D2D] rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">{name}</h3>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#10A37F] hover:underline"
              >
                <Link2 size={14} />
                <span>{url}</span>
              </a>
            )}
          </div>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {username && (
          <div className="text-sm">
            <span className="text-gray-400">Username:</span>{' '}
            <span className="text-gray-200">{username}</span>
          </div>
        )}

        {notes && (
          <p className="text-sm text-gray-400">{notes}</p>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users size={14} />
          <span>
            {isPublic ? 'Public Resource' : `Shared with ${accessUsers.length} user${accessUsers.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={onDelete}
        resourceName={name}
      />
    </>
  );
}