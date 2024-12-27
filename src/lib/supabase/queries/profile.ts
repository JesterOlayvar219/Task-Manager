import { supabase } from '../client';
import type { UserProfile } from '../../../types/user';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      last_active: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateLastActive(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}