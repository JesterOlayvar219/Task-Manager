-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
BEGIN
  -- Get username and display name from metadata or email
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Set display name from metadata or username
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    username_val
  );

  -- First update auth metadata to ensure it's set
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username_val,
    'displayName', display_name_val,
    'role', 'developer'
  )
  WHERE id = NEW.id;

  -- Then insert into public.users table with ON CONFLICT handling
  INSERT INTO public.users (
    id,
    username,
    "displayName",
    role,
    created_at,
    last_active
  ) VALUES (
    NEW.id,
    username_val,
    display_name_val,
    'developer',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    "displayName" = EXCLUDED."displayName",
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
     (NEW."displayName" IS DISTINCT FROM OLD."displayName") OR
     (NEW.role IS DISTINCT FROM OLD.role) THEN
    
    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'username', NEW.username,
      'displayName', NEW."displayName",
      'role', NEW.role
    )
    WHERE id = NEW.id::uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate task assignment
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate assignee exists
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = NEW.assignee::text
  ) THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  -- Validate creator exists
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = NEW.created_by::text
  ) THEN
    RAISE EXCEPTION 'Invalid creator: User does not exist';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Drop existing task validation trigger if it exists
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;

-- Create new task validation trigger
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_assignment();

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

-- Fix any existing users with missing metadata
UPDATE auth.users au
SET raw_user_meta_data = jsonb_build_object(
  'username', u.username,
  'displayName', u."displayName",
  'role', u.role
)
FROM public.users u
WHERE au.id = u.id::uuid
AND (
  au.raw_user_meta_data IS NULL OR 
  au.raw_user_meta_data = '{}'::jsonb OR
  au.raw_user_meta_data->>'displayName' IS NULL
);