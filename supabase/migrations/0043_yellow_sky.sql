/*
  # Fix Task Type Trigger

  1. Changes
    - Drop and recreate trigger with proper error handling
    - Update task type handling
    - Add proper constraints
    - Update indexes

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS ensure_task_type ON tasks;
DROP FUNCTION IF EXISTS handle_task_type();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- For personal tasks (no channel_id), set personal_chat_id to assignee's username
  IF NEW.channel_id IS NULL THEN
    -- Get username and set personal_chat_id
    NEW.personal_chat_id := (
      SELECT username 
      FROM users 
      WHERE id::text = NEW.assignee::text
    );
    
    -- Validate username was found
    IF NEW.personal_chat_id IS NULL THEN
      RAISE EXCEPTION 'Cannot find username for assignee';
    END IF;
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
  EXECUTE FUNCTION handle_task_type();

-- Add index for personal tasks
DROP INDEX IF EXISTS idx_tasks_personal_chat_id;
CREATE INDEX idx_tasks_personal_chat_id ON tasks(personal_chat_id)
WHERE personal_chat_id IS NOT NULL;