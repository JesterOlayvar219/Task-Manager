/*
  # Auth and User Validation Fixes
  
  1. Changes
    - Add display_name column with proper constraints
    - Update user validation logic
    - Fix UUID handling
    
  2. Security
    - Maintain existing RLS policies
    - Add validation for user existence
*/

-- First ensure display_name exists and has proper values
DO $$ 
BEGIN
  -- Add display_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE users ADD COLUMN display_name TEXT;
  END IF;

  -- Update NULL display_names with username
  UPDATE users 
  SET display_name = username 
  WHERE display_name IS NULL;

  -- Add NOT NULL constraint
  ALTER TABLE users 
    ALTER COLUMN display_name SET NOT NULL;
END $$;

-- Add check constraint for display_name length
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_display_name_length,
  ADD CONSTRAINT check_display_name_length 
  CHECK (char_length(display_name) BETWEEN 1 AND 50);

-- Create function to validate UUID
CREATE OR REPLACE FUNCTION is_valid_uuid(str TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN str IS NOT NULL AND str ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_valid_uuid(user_id) THEN
    RETURN FALSE;
  END IF;
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
  -- Validate UUIDs
  IF NOT is_valid_uuid(NEW.assignee) THEN
    RAISE EXCEPTION 'Invalid assignee: Not a valid UUID';
  END IF;

  IF NOT is_valid_uuid(NEW.created_by) THEN
    RAISE EXCEPTION 'Invalid creator: Not a valid UUID';
  END IF;

  -- Get username for the assignee
  SELECT username INTO username_val
  FROM users 
  WHERE id::text = NEW.assignee;

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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

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

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;