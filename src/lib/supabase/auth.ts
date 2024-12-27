import { supabase } from './client';
import type { UserRole } from '../../types/user';

export async function signUp(email: string, password: string, username: string, role: UserRole) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // Create user profile in the users table
  const { error: profileError } = await supabase
    .from('users')
    .insert([{
      id: authData.user?.id,
      username,
      role,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }]);

  if (profileError) throw profileError;

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}