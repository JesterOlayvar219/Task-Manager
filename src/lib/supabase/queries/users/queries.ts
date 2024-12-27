import { supabase } from '../../client';
import type { UserProfile } from '../../../../types/user';

export async function validateUsername(username: string): Promise<boolean> {
  if (!username) return false;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data !== null;
  } catch (err) {
    console.error('Error validating username:', err);
    return false;
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  if (!username) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}