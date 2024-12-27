import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { TaskFile } from '../types/task';

export function useTaskFiles() {
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (taskId: string, files: File[]): Promise<TaskFile[]> => {
    try {
      setUploading(true);
      
      // First get existing files
      const { data: task } = await supabase
        .from('tasks')
        .select('files')
        .eq('id', taskId)
        .single();

      const existingFiles = task?.files || [];
      
      const uploads = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${taskId}/${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-files')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: publicUrl
        };
      });

      const uploadedFiles = await Promise.all(uploads);

      // Combine existing and new files
      const allFiles = [...existingFiles, ...uploadedFiles];

      // Update task with combined files
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          files: allFiles
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (taskId: string, fileUrl: string) => {
    try {
      // Get existing files
      const { data: task } = await supabase
        .from('tasks')
        .select('files')
        .eq('id', taskId)
        .single();

      const existingFiles = task?.files || [];
      
      // Remove file from array
      const updatedFiles = existingFiles.filter((file: TaskFile) => file.url !== fileUrl);

      // Update task with new files array
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          files: updatedFiles
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Extract file path from URL
      const filePath = fileUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('task-files')
          .remove([`${taskId}/${filePath}`]);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  };

  return {
    uploading,
    uploadFiles,
    deleteFile
  };
}