import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';

const TYPING_TIMEOUT = 2000; // 2 seconds
const DEBOUNCE_DELAY = 100; // 100ms debounce

export function useTypingIndicator(channelId: string | undefined, username: string | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to typing status changes
  useEffect(() => {
    if (!channelId || !username) return;

    const channel = supabase.channel(`typing:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(payload.old.username);
              return next;
            });
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const typingUser = payload.new.username;
            if (typingUser !== username) {
              setTypingUsers(prev => new Set([...prev, typingUser]));
              
              // Auto-remove after timeout
              setTimeout(() => {
                setTypingUsers(prev => {
                  const next = new Set(prev);
                  next.delete(typingUser);
                  return next;
                });
              }, TYPING_TIMEOUT + 500);
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channelId && username) {
        // Clear typing status on unmount
        supabase
          .from('typing_status')
          .delete()
          .match({ channel_id: channelId, username })
          .then(() => supabase.removeChannel(channel))
          .catch(console.error);
      }
    };
  }, [channelId, username]);

  const broadcastTyping = useCallback(async () => {
    if (!username || !channelId) return;

    try {
      // Clear existing timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Debounce the typing update
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          await supabase
            .from('typing_status')
            .upsert(
              {
                channel_id: channelId,
                username,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'channel_id,username' }
            );

          // Set timeout to clear typing status
          typingTimeoutRef.current = setTimeout(async () => {
            try {
              await supabase
                .from('typing_status')
                .delete()
                .match({ channel_id: channelId, username });
            } catch (err) {
              console.error('Error clearing typing status:', err);
            }
          }, TYPING_TIMEOUT);
        } catch (err) {
          console.error('Error broadcasting typing status:', err);
        }
      }, DEBOUNCE_DELAY);
    } catch (err) {
      console.error('Error in broadcastTyping:', err);
    }
  }, [channelId, username]);

  return {
    typingUsers: Array.from(typingUsers),
    broadcastTyping
  };
}