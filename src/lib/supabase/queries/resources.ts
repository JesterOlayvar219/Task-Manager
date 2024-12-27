import { supabase } from '../client';
import type { Resource } from '../../../types/resource';

export async function getResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getResourceById(id: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSharedResources(userId: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .contains('access_users', [userId])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}