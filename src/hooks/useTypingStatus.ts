import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { updateTypingStatus, clearTypingStatus } from '../lib/supabase/services/typingStatus';

const TYPING_TIMEOUT = 2000; // 2 seconds
const DEBOUNCE_DELAY = 100; // 100ms debounce

export function useTypingStatus(channelId: string, username: string | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to typing status changes
  useEffect(() => {
    if (!channelId || !username) return;

    // Subscribe to ALL changes on typing_status table
    const channel = supabase.channel('typing-status')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('Typing status change received:', payload);
          
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
              }, TYPING_TIMEOUT + 1000); // Add 1s buffer
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Typing subscription status:', status);
      });

    return () => {
      console.log('Cleaning up typing subscription');
      clearTypingStatus(channelId, username).catch(console.error);
      supabase.removeChannel(channel);
    };
  }, [channelId, username]);

  // Broadcast typing status with debounce
  const broadcastTyping = useCallback(async () => {
    if (!username || !channelId) return;

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
        await updateTypingStatus(channelId, username);
        console.log('Typing status updated');

        // Set timeout to clear typing status
        typingTimeoutRef.current = setTimeout(async () => {
          try {
            await clearTypingStatus(channelId, username);
            console.log('Typing status cleared');
          } catch (err) {
            console.error('Error clearing typing status:', err);
          }
        }, TYPING_TIMEOUT);
      } catch (err) {
        console.error('Error broadcasting typing status:', err);
      }
    }, DEBOUNCE_DELAY);
  }, [channelId, username]);

  return {
    typingUsers: Array.from(typingUsers),
    broadcastTyping
  };
}