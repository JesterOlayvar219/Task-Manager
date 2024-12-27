/*
  # Fix task username handling

  1. Changes
    - Update task_details view to properly join on username fields
    - Add proper indexes for username-based joins
    - Update task validation function to use usernames
    
  2. Indexes
    - Add indexes to improve join performance
*/

-- Drop existing view
DROP VIEW IF EXISTS task_details;

-- Create improved task_details view with username joins
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
  -- Use COALESCE to fall back to username if no display name
  COALESCE(c."displayName", c.username) as creator_username,
  COALESCE(a."displayName", a.username) as assignee_username
FROM tasks t
-- Join with users table for creator using username
LEFT JOIN users c ON c.username = t.created_by
-- Join with users table for assignee using username
LEFT JOIN users a ON a.username = t.assignee;

-- Add indexes for better join performance
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_tasks_created_by;
DROP INDEX IF EXISTS idx_tasks_assignee;

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);

-- Update task validation function to use usernames
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_exists BOOLEAN;
  creator_exists BOOLEAN;
BEGIN
  -- Check if users exist by username
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.assignee
  ) INTO assignee_exists;

  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.created_by
  ) INTO creator_exists;

  -- Validate users exist
  IF NOT assignee_exists THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  IF NOT creator_exists THEN
    RAISE EXCEPTION 'Invalid creator: User does not exist';
  END IF;

  -- Set personal_chat_id for personal tasks
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate task validation trigger
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_assignment();

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;