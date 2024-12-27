import { supabase } from '../client';
import type { UserProfile } from '../../../types/user';

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    lastActive: data.last_active
  } as UserProfile;
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  // Convert camelCase to snake_case for database
  const updateData = {
    ...(updates.username && { username: updates.username }),
    ...(updates.role && { role: updates.role }),
    ...(updates.profileImage && { profile_image: updates.profileImage }),
    last_active: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Convert back to camelCase for frontend
  return {
    id: data.id,
    username: data.username,
    role: data.role,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    lastActive: data.last_active
  } as UserProfile;
}