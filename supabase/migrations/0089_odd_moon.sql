-- First backup the data
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Drop dependent views
DROP VIEW IF EXISTS task_details;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS sync_user_profile();

-- Modify users table
ALTER TABLE users 
  DROP COLUMN IF EXISTS "displayName";

-- Recreate task_details view with simplified user info
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
  c.username as creator_username,
  a.username as assignee_username
FROM tasks t
LEFT JOIN users c ON c.username = t.created_by
LEFT JOIN users a ON a.username = t.assignee;

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  -- Get username from email
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- Update auth metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username_val,
    'role', 'developer'
  )
  WHERE id = NEW.id;

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    role,
    created_at,
    last_active
  ) VALUES (
    NEW.id,
    username_val,
    'developer',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    last_active = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to sync profile updates
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if relevant fields changed
  IF (NEW.username IS DISTINCT FROM OLD.username) OR
     (NEW.role IS DISTINCT FROM OLD.role) THEN
    
    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'username', NEW.username,
      'role', NEW.role
    )
    WHERE id = NEW.id::uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;