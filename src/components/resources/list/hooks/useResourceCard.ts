import { useState } from 'react';
import { useResourceSharing } from '../../../../hooks/useResourceSharing';
import type { Resource } from '../../../../types/resource';

export function useResourceCard(resource: Resource, onDelete: (id: string) => void) {
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

  const handleDelete = () => {
    onDelete(resource.id);
    setShowDeleteDialog(false);
  };

  return {
    isExpanded,
    showShareDialog,
    showDeleteDialog,
    setIsExpanded,
    setShowShareDialog,
    setShowDeleteDialog,
    handleShare,
    handleDelete,
  };
}