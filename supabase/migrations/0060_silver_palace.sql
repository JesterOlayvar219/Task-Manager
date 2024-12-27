/*
  # Fix Display Name Column Mismatch

  1. Changes
    - Rename display_name column to displayName to match auth table
    - Update all references to use new column name
    - Migrate existing data

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- First rename the column
ALTER TABLE users 
  RENAME COLUMN display_name TO "displayName";

-- Update task_details view to use new column name
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
  COALESCE(c."displayName", c.username) as creator_username,
  COALESCE(a."displayName", a.username) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Update user profile trigger to use new column name
CREATE OR REPLACE FUNCTION handle_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set displayName to username if not provided
  IF NEW."displayName" IS NULL THEN
    NEW."displayName" := NEW.username;
  END IF;

  -- Ensure required fields
  IF NEW.username IS NULL THEN
    RAISE EXCEPTION 'Username is required';
  END IF;

  IF NEW.role IS NULL THEN
    RAISE EXCEPTION 'Role is required';
  END IF;

  -- Set timestamps if not provided
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  IF NEW.last_active IS NULL THEN
    NEW.last_active := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update indexes
DROP INDEX IF EXISTS idx_users_display_name;
CREATE INDEX idx_users_displayName ON users("displayName");

-- Update constraints
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_display_name_length,
  ADD CONSTRAINT check_displayName_length 
  CHECK (char_length("displayName") BETWEEN 1 AND 50);

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;