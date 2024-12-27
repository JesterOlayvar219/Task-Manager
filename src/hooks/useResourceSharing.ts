import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { Resource } from '../types/resource';

export function useResourceSharing(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareWithUsers = async (resourceId: string, users: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: err } = await supabase
        .from('resources')
        .update({ access_users: users })
        .eq('id', resourceId);

      if (err) throw err;
    } catch (err) {
      setError('Failed to share resource');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: err } = await supabase
        .from('resources')
        .select('*')
        .contains('access_users', [userId])
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError('Failed to fetch shared resources');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    shareWithUsers,
    fetchSharedResources,
  };
}