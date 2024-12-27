/*
  # User Profile Enhancements
  
  1. Changes
    - Add display_name column
    - Set display name from username if empty
    - Update user profile constraints
    
  2. Security
    - Maintain existing RLS policies
    - Add validation for display name
*/

-- First add display_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE users ADD COLUMN display_name TEXT;
  END IF;
END $$;

-- Update display_name with username for existing users
UPDATE users 
SET display_name = username 
WHERE display_name IS NULL;

-- Add NOT NULL constraint to display_name
ALTER TABLE users 
  ALTER COLUMN display_name SET NOT NULL;

-- Add check constraint for display_name length
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_display_name_length,
  ADD CONSTRAINT check_display_name_length 
  CHECK (char_length(display_name) BETWEEN 1 AND 50);

-- Update task_details view to use display_name
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