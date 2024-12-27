-- Drop existing function and recreate with better validation
DROP FUNCTION IF EXISTS handle_task_assignment CASCADE;

CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_exists BOOLEAN;
  creator_exists BOOLEAN;
BEGIN
  -- Check if users exist
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id::text = NEW.assignee::text
  ) INTO assignee_exists;

  SELECT EXISTS (
    SELECT 1 FROM users WHERE id::text = NEW.created_by::text
  ) INTO creator_exists;

  -- Validate users exist
  IF NOT assignee_exists THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  IF NOT creator_exists THEN
    RAISE EXCEPTION 'Invalid creator: User does not exist';
  END IF;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_assignment();

-- Update users table to ensure display_name is set
UPDATE users
SET display_name = username
WHERE display_name IS NULL;

-- Add NOT NULL constraint to display_name if not exists
DO $$ 
BEGIN
  ALTER TABLE users 
    ALTER COLUMN display_name SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add check constraint for display_name if not exists
DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT check_display_name_length
    CHECK (char_length(display_name) BETWEEN 1 AND 50);
EXCEPTION
  WHEN others THEN NULL;
END $$;

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