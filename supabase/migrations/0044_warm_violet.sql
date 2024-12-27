/*
  # Fix Task Type Trigger

  1. Changes
    - Drop and recreate trigger with proper error handling
    - Update trigger function to handle username assignment
    - Add proper constraints and checks

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS ensure_task_type ON tasks;

-- Create improved trigger function
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  -- Get username for the assignee
  SELECT username INTO username_val
  FROM users 
  WHERE id::text = NEW.assignee::text;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    -- For personal tasks, use assignee's username
    IF username_val IS NULL THEN
      RAISE EXCEPTION 'Cannot find username for assignee';
    END IF;
    NEW.personal_chat_id := username_val;
  ELSE
    -- For channel tasks, ensure personal_chat_id is NULL
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER ensure_task_type
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  WHEN (NEW.channel_id IS NULL OR NEW.personal_chat_id IS NULL)
  EXECUTE FUNCTION handle_task_type();

-- Add constraint to ensure task type consistency
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update indexes
DROP INDEX IF EXISTS idx_tasks_personal_chat_id;
CREATE INDEX idx_tasks_personal_chat_id ON tasks(personal_chat_id)
WHERE personal_chat_id IS NOT NULL;