import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import type { Resource } from '../types/resource';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;

    loadResources();

    const channel = supabase
      .channel('resources_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources'
        },
        () => loadResources()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const addResource = async (resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    if (!username) throw new Error('Must be logged in to add resources');

    try {
      // Ensure access_users is an array and contains at least one value
      const access_users = resourceData.accessUsers.length > 0 
        ? resourceData.accessUsers 
        : ['Everyone'];

      const { data, error } = await supabase
        .from('resources')
        .insert([{
          name: resourceData.name,
          url: resourceData.url || null,
          username: resourceData.username || null,
          password: resourceData.password || null,
          access_users,
          notes: resourceData.notes || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding resource:', error);
        throw new Error('Failed to add resource');
      }

      await loadResources(); // Reload resources after adding
      return data;
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!username) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
      await loadResources(); // Reload resources after deleting
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    addResource,
    deleteResource
  };
}