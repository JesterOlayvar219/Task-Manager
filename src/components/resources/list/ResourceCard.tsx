import React, { useState } from 'react';
import { ResourceCardHeader } from './ResourceCardHeader';
import { ResourceCardContent } from './ResourceCardContent';
import { ResourceCardFooter } from './ResourceCardFooter';
import { ResourceCardActions } from './ResourceCardActions';
import { ShareResourceDialog } from '../dialogs/ShareResourceDialog';
import { DeleteResourceDialog } from '../dialogs/DeleteResourceDialog';
import { useResourceSharing } from '../../../hooks/useResourceSharing';
import type { Resource } from '../../../types/resource';

interface ResourceCardProps {
  resource: Resource;
  onDelete: (id: string) => void;
}

export function ResourceCard({ resource, onDelete }: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { shareWithUsers } = useResourceSharing('@evanc949_36324');

  const handleShare = async (resourceId: string, users: string[]) => {
    try {
      await shareWithUsers(resourceId, users);
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  return (
    <>
      <div className="bg-[#2D2D2D] rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between">
          <ResourceCardHeader 
            resource={resource} 
            isExpanded={isExpanded}
            onExpandToggle={() => setIsExpanded(!isExpanded)}
          />
          <ResourceCardActions
            onShare={() => setShowShareDialog(true)}
            onEdit={() => {}} // Implement edit functionality
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>
        
        <ResourceCardContent 
          resource={resource} 
          isExpanded={isExpanded} 
        />
        
        <ResourceCardFooter 
          accessUsers={resource.accessUsers} 
        />
      </div>

      <ShareResourceDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={handleShare}
        resource={resource}
      />

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete(resource.id);
          setShowDeleteDialog(false);
        }}
        resourceName={resource.name}
      />
    </>
  );
}