import { useCallback } from 'react';
import { markMessagesAsRead } from '../lib/supabase/messages/readStatus';
import { useUsername } from './useUsername';
import { useAuthContext } from '../contexts/AuthContext';

export function useMessageReadStatus() {
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  const markAsRead = useCallback(async (senderId: string) => {
    if (!username || !senderId) return;
    
    try {
      await markMessagesAsRead(senderId, username);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [username]);

  return { markAsRead };
}