import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export function useUsername(userId: string | undefined) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const getUsername = async () => {
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();
        
      if (data) {
        setUsername(data.username);
      }
    };

    getUsername();
  }, [userId]);

  return { username };
}