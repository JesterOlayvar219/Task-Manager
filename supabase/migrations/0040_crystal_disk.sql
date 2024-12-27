/*
  # Fix Personal Tasks Migration

  1. Changes
    - Add trigger to automatically set personal_chat_id for personal tasks
    - Update existing tasks to ensure proper personal_chat_id values
    - Add validation to ensure task type consistency
    - Update RLS policies to handle personal tasks properly

  2. Security
    - Maintain existing RLS policies
    - Add specific checks for personal tasks access
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- For personal tasks (no channel_id), set personal_chat_id to assignee
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    -- For channel tasks, ensure personal_chat_id is NULL
    NEW.personal_chat_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS ensure_task_type ON tasks;
CREATE TRIGGER ensure_task_type
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_type();

-- Update existing tasks to ensure consistency
UPDATE tasks
SET personal_chat_id = 
  CASE 
    WHEN channel_id IS NULL THEN assignee
    ELSE NULL
  END;

-- Add constraint to ensure task type consistency
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update RLS policies
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    channel_id IS NOT NULL OR
    personal_chat_id = auth.uid()::text OR
    created_by = auth.uid()::text
  );

-- Create policy
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()::text AND
    (
      channel_id IS NOT NULL OR
      (channel_id IS NULL AND assignee = auth.uid()::text)
    )
  );

-- Update policy
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()::text OR
    assignee = auth.uid()::text OR
    personal_chat_id = auth.uid()::text
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()::text OR
    personal_chat_id = auth.uid()::text
  );

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_tasks_personal_chat_id ON tasks(personal_chat_id)
WHERE personal_chat_id IS NOT NULL;