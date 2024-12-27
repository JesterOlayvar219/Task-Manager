import { useCallback } from 'react';
import type { Resource } from '../types/resource';

interface UseResourceNotificationsProps {
  addNotification: (message: string, recipient: string, type: 'resource') => void;
}

export function useResourceNotifications({ addNotification }: UseResourceNotificationsProps) {
  const notifyNewResource = useCallback((resource: Resource) => {
    resource.accessUsers.forEach(user => {
      if (user !== 'Everyone') {
        addNotification(
          `New resource "${resource.name}" has been shared with you.`,
          user,
          'resource'
        );
      }
    });
  }, [addNotification]);

  return {
    notifyNewResource,
  };
}