-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Task owners can delete files" ON storage.objects;

-- Create simplified storage policies
CREATE POLICY "Storage access policy"
  ON storage.objects FOR ALL 
  TO authenticated
  USING (bucket_id = 'task-files')
  WITH CHECK (bucket_id = 'task-files');

-- Ensure storage bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', true)
ON CONFLICT (id) DO NOTHING;

-- Update task RLS policies
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Create simplified task policies
CREATE POLICY "Task access policy"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);