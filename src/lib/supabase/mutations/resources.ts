import { supabase } from '../client';
import type { Resource } from '../../../types/resource';

export async function createResource(data: Omit<Resource, 'id' | 'createdAt'>) {
  // Convert camelCase to snake_case for Supabase
  const resourceData = {
    name: data.name,
    url: data.url,
    username: data.username,
    password: data.password,
    access_users: data.accessUsers,
    notes: data.notes,
    file_url: data.fileUrl,
    file_name: data.fileName,
    created_at: new Date().toISOString()
  };

  const { data: newResource, error } = await supabase
    .from('resources')
    .insert([resourceData])
    .select()
    .single();

  if (error) throw error;

  // Convert back to camelCase for frontend
  return {
    id: newResource.id,
    name: newResource.name,
    url: newResource.url,
    username: newResource.username,
    password: newResource.password,
    accessUsers: newResource.access_users,
    notes: newResource.notes,
    fileUrl: newResource.file_url,
    fileName: newResource.file_name,
    createdAt: newResource.created_at
  } as Resource;
}

export async function updateResource(id: string, updates: Partial<Resource>) {
  // Convert camelCase to snake_case for Supabase
  const updateData = {
    ...(updates.name && { name: updates.name }),
    ...(updates.url && { url: updates.url }),
    ...(updates.username && { username: updates.username }),
    ...(updates.password && { password: updates.password }),
    ...(updates.accessUsers && { access_users: updates.accessUsers }),
    ...(updates.notes && { notes: updates.notes }),
    ...(updates.fileUrl && { file_url: updates.fileUrl }),
    ...(updates.fileName && { file_name: updates.fileName })
  };

  const { data: updatedResource, error } = await supabase
    .from('resources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Convert back to camelCase for frontend
  return {
    id: updatedResource.id,
    name: updatedResource.name,
    url: updatedResource.url,
    username: updatedResource.username,
    password: updatedResource.password,
    accessUsers: updatedResource.access_users,
    notes: updatedResource.notes,
    fileUrl: updatedResource.file_url,
    fileName: updatedResource.file_name,
    createdAt: updatedResource.created_at
  } as Resource;
}