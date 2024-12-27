-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS sync_user_profile();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
  role_val TEXT;
BEGIN
  -- Get values from metadata or defaults
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  role_val := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'developer'
  );

  -- First update auth.users metadata to ensure it's set before the trigger
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username_val,
    'displayName', display_name_val,
    'role', role_val
  )
  WHERE id = NEW.id;

  -- Then insert into public.users table
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
    role_val,
    NEW.created_at,
    NEW.last_sign_in_at
  );

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

-- Create trigger for new auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create trigger for profile updates
CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Update existing users to ensure consistency
UPDATE auth.users au
SET raw_user_meta_data = jsonb_build_object(
  'username', u.username,
  'displayName', u."displayName",
  'role', u.role
)
FROM public.users u
WHERE au.id = u.id::uuid;