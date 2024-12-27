-- First ensure displayName exists and has proper values
DO $$ 
BEGIN
  -- Add displayName if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'displayName'
  ) THEN
    ALTER TABLE users ADD COLUMN "displayName" TEXT;
  END IF;

  -- Update NULL displayNames with username
  UPDATE users 
  SET "displayName" = username 
  WHERE "displayName" IS NULL;

  -- Add NOT NULL constraint
  ALTER TABLE users 
    ALTER COLUMN "displayName" SET NOT NULL;
END $$;

-- Add check constraint for displayName length
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_displayName_length,
  ADD CONSTRAINT check_displayName_length 
  CHECK (char_length("displayName") BETWEEN 1 AND 50);

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
  COALESCE(c."displayName", c.username) as creator_username,
  COALESCE(a."displayName", a.username) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Update user profile trigger
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

-- Create trigger for user profile management
DROP TRIGGER IF EXISTS manage_user_profile ON users;
CREATE TRIGGER manage_user_profile
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_profile();

-- Add index for displayName
DROP INDEX IF EXISTS idx_users_displayName;
CREATE INDEX idx_users_displayName ON users("displayName");

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;