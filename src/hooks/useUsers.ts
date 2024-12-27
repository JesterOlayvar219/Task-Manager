import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { UserProfile } from '../types/user';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from('users')
          .select('id, username, role')
          .order('username');

        if (err) throw err;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error
  };
}