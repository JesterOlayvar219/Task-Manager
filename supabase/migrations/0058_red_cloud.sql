/*
  # User and Task Schema Update

  1. User Table Updates
    - Add display_name column
    - Add proper constraints
    - Add indexes for performance

  2. Task Table Updates
    - Update field types
    - Add proper constraints
    - Add indexes for performance

  3. Security
    - Update RLS policies
    - Add validation functions
*/

-- First ensure users table has proper structure
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

-- Update existing users to ensure display_name is set
UPDATE users 
SET display_name = username 
WHERE display_name IS NULL;

-- Add NOT NULL constraint to display_name
ALTER TABLE users 
  ALTER COLUMN display_name SET NOT NULL;

-- Add constraints
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_display_name_length,
  ADD CONSTRAINT check_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 50),
  DROP CONSTRAINT IF EXISTS check_username_length,
  ADD CONSTRAINT check_username_length CHECK (char_length(username) BETWEEN 3 AND 30);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);

-- Update task_details view
DROP VIEW IF EXISTS task_details;
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.created_by,
  t.assignee,
  t.due_date,
  t.status,
  t.channel_id,
  t.personal_chat_id,
  t.created_at,
  t.files,
  COALESCE(c.display_name, c.username) as creator_username,
  COALESCE(a.display_name, a.username) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Create function to validate user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id::text = user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to handle task assignment
CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  -- Get username for the assignee
  SELECT username INTO username_val
  FROM users 
  WHERE id::text = NEW.assignee::text;

  -- Validate assignee exists
  IF username_val IS NULL THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := username_val;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task assignment
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_assignment();

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
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid()) OR
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
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()::text OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;