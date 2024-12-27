/*
  # User Profile and Task Creation Fixes
  
  1. Changes
    - Add display_name column with proper defaults
    - Update task creation constraints
    - Fix user validation in tasks
    - Add proper indexes
    
  2. Security
    - Maintain existing RLS policies
    - Add validation for display name
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
BEGIN
  -- Validate assignee exists
  IF NOT check_user_exists(NEW.assignee) THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  -- Validate creator exists
  IF NOT check_user_exists(NEW.created_by) THEN
    RAISE EXCEPTION 'Invalid creator: User does not exist';
  END IF;

  -- Set personal_chat_id for personal tasks
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := (
      SELECT username 
      FROM users 
      WHERE id::text = NEW.assignee::text
    );
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