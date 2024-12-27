import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { UserProfile } from '../types/user';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setProfile(null);
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: authData } = await supabase.auth.getUser();
            if (!authData.user) throw new Error('No authenticated user');

            const newProfile = {
              id: userId,
              username: authData.user.email?.split('@')[0] || 'User',
              display_name: authData.user.email?.split('@')[0] || 'User',
              role: 'developer',
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('users')
              .insert([newProfile])
              .select()
              .single();

            if (createError) throw createError;
            if (mounted) setProfile(createdProfile as UserProfile);
          } else {
            throw fetchError;
          }
        } else if (mounted) {
          setProfile(existingProfile as UserProfile);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (mounted) setError('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { profile, loading, error };
}