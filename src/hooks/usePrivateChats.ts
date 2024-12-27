import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import type { PrivateChat } from '../types/privateChat';

export function usePrivateChats() {
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  const fetchChats = useCallback(async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('private_chats')
        .select(`
          id,
          name,
          creator_id,
          is_hidden,
          created_at,
          private_chat_members!inner(user_id)
        `)
        .eq('private_chat_members.user_id', username)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setChats(data || []);
    } catch (err) {
      console.error('Error fetching private chats:', err);
      setError('Failed to load private chats');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;

    fetchChats();

    // Subscribe to changes
    const channel = supabase.channel('private_chats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'private_chats'
        },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, fetchChats]);

  const createChat = async (name: string, memberUsernames: string[]) => {
    if (!username) throw new Error('Not authenticated');
    if (!name.trim()) throw new Error('Chat name is required');
    if (memberUsernames.length === 0) throw new Error('At least one member is required');

    try {
      const { data: chat, error: chatError } = await supabase
        .from('private_chats')
        .insert({
          name: name.trim(),
          creator_id: username
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members including creator
      const allMembers = [...new Set([username, ...memberUsernames])];
      const { error: membersError } = await supabase
        .from('private_chat_members')
        .insert(
          allMembers.map(member => ({
            private_chat_id: chat.id,
            user_id: member
          }))
        );

      if (membersError) {
        // Cleanup chat if member creation fails
        await supabase.from('private_chats').delete().eq('id', chat.id);
        throw membersError;
      }

      await fetchChats();
      return chat;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw new Error('Failed to create chat');
    }
  };

  return {
    chats,
    loading,
    error,
    createChat
  };
}