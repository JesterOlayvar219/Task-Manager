-- Create storage policies for task-files bucket
DO $$ 
BEGIN
  -- Enable RLS for storage
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
  DROP POLICY IF EXISTS "Task owners can delete files" ON storage.objects;

  -- Create upload policy
  CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'task-files' AND
      -- Ensure file is being uploaded to a task folder
      (regexp_match(name, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.*$'))[1] IS NOT NULL
    );

  -- Create read policy
  CREATE POLICY "Authenticated users can read files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'task-files' AND
      -- Allow access if user created the task or is assigned to it
      EXISTS (
        SELECT 1 FROM tasks t
        WHERE 
          -- Extract task ID from file path
          t.id::text = (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/.*$'))[1]
          AND (
            t.created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
            t.assignee = (SELECT username FROM users WHERE id = auth.uid())
          )
      )
    );

  -- Create delete policy
  CREATE POLICY "Task owners can delete files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'task-files' AND
      -- Only allow task creator to delete files
      EXISTS (
        SELECT 1 FROM tasks t
        WHERE 
          t.id::text = (regexp_match(name, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/.*$'))[1]
          AND t.created_by = (SELECT username FROM users WHERE id = auth.uid())
      )
    );
END $$;